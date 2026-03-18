import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/hooks/useTheme';
import { LeafletMap, type LeafletMapHandle } from '@/components/LeafletMap';
import { Header } from '@/components/Header';
import type { Country } from './countriesSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const CARD_HEIGHT = 170;
const SPRING = { damping: 22, stiffness: 260 };

// Floating header geometry — must stay in sync with Header's floatRow style
const HEADER_TOP_OFFSET  = 8;   // gap below safe-area inset
const HEADER_HEIGHT      = 44;  // floatCircle / floatTitlePill height
const HEADER_BOTTOM_GAP  = 12;  // gap between header and search bar
const SEARCH_BAR_HEIGHT  = 48;
const SEARCH_RESULTS_GAP = 4;

export function MapScreen({ navigation }: Props) {
  const countries = useAppSelector((s) => s.countries.countries);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const mapRef = useRef<LeafletMapHandle>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Glass surface for search bar + results — same formula as Header's glass variant
  const glass = isDark ? 'rgba(12,12,12,0.82)' : 'rgba(255,255,255,0.90)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  // Vertical layout derived from named constants — update constants if Header geometry changes
  const searchTop  = insets.top + HEADER_TOP_OFFSET + HEADER_HEIGHT + HEADER_BOTTOM_GAP;
  const resultsTop = searchTop + SEARCH_BAR_HEIGHT + SEARCH_RESULTS_GAP;

  // Clear the blur timer on unmount so it never fires on an unmounted component
  useEffect(() => () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
  }, []);

  // ── Search state ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo<Country[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return countries
      .filter(c => c.latlng?.length === 2 && c.name.common.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, countries]);

  const onSearchChange = useCallback((text: string) => {
    setQuery(text);
    setShowResults(text.trim().length > 0);
  }, []);

  const onResultPress = useCallback((country: Country) => {
    Keyboard.dismiss();
    setQuery(country.name.common);
    setShowResults(false);
    mapRef.current?.flyTo(country.latlng[0], country.latlng[1], 5);
  }, []);

  const onSearchBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setShowResults(false), 150);
  }, []);

  // ── Reset to world view ──────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    mapRef.current?.flyTo(20, 0, 2);
  }, []);

  // ── Selected-country card ────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Country | null>(null);
  const cardY = useSharedValue(CARD_HEIGHT + 40);
  const cardOpacity = useSharedValue(0);

  const showCard = useCallback((country: Country) => {
    setSelected(country);
    cardY.value = withSpring(0, SPRING);
    cardOpacity.value = withTiming(1, { duration: 200 });
  }, [cardY, cardOpacity]);

  const hideCard = useCallback(() => {
    cardY.value = withSpring(CARD_HEIGHT + 40, SPRING);
    cardOpacity.value = withTiming(0, { duration: 150 });
    mapRef.current?.closePopup();
  }, [cardY, cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));

  const onCountryPress = useCallback((cca3: string) => {
    const country = countries.find(c => c.cca3 === cca3);
    if (country) showCard(country);
  }, [countries, showCard]);

  const goToDetail = useCallback(() => {
    if (!selected) return;
    hideCard();
    navigation.navigate('CountryDetail', { cca3: selected.cca3 });
  }, [selected, navigation, hideCard]);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (countries.length === 0) {
    return (
      <View testID="map-empty" style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No countries loaded yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root} testID="map-screen">

      {/* ── Full-screen Leaflet map ── */}
      <LeafletMap
        ref={mapRef}
        countries={countries}
        onCountryPress={onCountryPress}
        testID="leaflet-map"
      />

      {/* ── Glass floating header ── */}
      <Header
        variant="glass"
        title="World Map"
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'globe-outline',
          onPress: resetView,
          accessibilityLabel: 'Reset map view',
        }}
      />

      {/* ── Floating search bar ── */}
      <View
        style={[
          styles.searchContainer,
          { top: searchTop, backgroundColor: glass, borderColor: glassBorder },
        ]}
        testID="map-search-bar"
      >
        <Ionicons name="search-outline" size={17} color={colors.textSecondary} />

        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search countries…"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={onSearchChange}
          onBlur={onSearchBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => { setQuery(''); setShowResults(false); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Search results dropdown ── */}
      {showResults && searchResults.length > 0 && (
        <View
          style={[
            styles.resultsDropdown,
            {
              top: resultsTop,
              backgroundColor: isDark ? 'rgba(18,18,18,0.96)' : 'rgba(255,255,255,0.96)',
              borderColor: glassBorder,
            },
          ]}
        >
          <FlatList
            data={searchResults}
            keyExtractor={item => item.cca3}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.resultRow,
                  index < searchResults.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => onResultPress(item)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: item.flags.png }} style={styles.resultFlag} resizeMode="cover" />
                <View style={styles.resultText}>
                  <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
                    {item.name.common}
                  </Text>
                  <Text style={[styles.resultRegion, { color: colors.textSecondary }]}>
                    {item.region}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* ── Bottom country card (slides up on marker press) ── */}
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          {
            bottom: insets.bottom + 16,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        testID="country-card"
        pointerEvents={selected ? 'auto' : 'none'}
      >
        {selected && (
          <>
            <View style={styles.cardHandle}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.cardBody}>
              <Image source={{ uri: selected.flags.png }} style={styles.cardFlag} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                  {selected.name.common}
                </Text>
                <Text style={[styles.cardRegion, { color: colors.textSecondary }]}>
                  {selected.region}
                  {selected.capital?.length ? `  ·  ${selected.capital[0]}` : ''}
                </Text>
                <Text style={[styles.cardPop, { color: colors.textSecondary }]}>
                  {selected.population.toLocaleString()} people
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.cardClose, { backgroundColor: colors.inputBg }]}
                onPress={hideCard}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.text }]}
              onPress={goToDetail}
              activeOpacity={0.85}
              testID="explore-country-btn"
            >
              <Text style={[styles.exploreBtnText, { color: colors.background }]}>
                Explore {selected.name.common}
              </Text>
              <Ionicons name="arrow-forward" size={15} color={colors.background} />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },

  // Search bar
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
    paddingVertical: 0,
  },

  // Results dropdown
  resultsDropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 19,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  resultFlag: { width: 34, height: 23, borderRadius: 4 },
  resultText: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  resultRegion: { fontSize: 12, marginTop: 1 },

  // Bottom card
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 20,
  },
  cardHandle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 14,
  },
  cardFlag: { width: 64, height: 44, borderRadius: 8 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.4 },
  cardRegion: { fontSize: 13, marginTop: 3 },
  cardPop: { fontSize: 12, marginTop: 2 },
  cardClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Explore button
  exploreBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  exploreBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
});
