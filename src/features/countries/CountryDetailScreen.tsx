import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavorite } from './countriesSlice';
import {
  formatPopulation,
  getLanguagesList,
  getCurrencyList,
  getCapital,
} from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { Header } from '@/components/Header';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

type Props = NativeStackScreenProps<RootStackParamList, 'CountryDetail'>;

export function CountryDetailScreen({ route, navigation }: Props) {
  const { cca3 } = route.params;
  const dispatch = useAppDispatch();
  const colors = useTheme();

  const scrollY = useSharedValue(0);

  const country = useAppSelector((state) =>
    state.countries.countries.find((c) => c.cca3 === cca3),
  );
  const isFavorite = useAppSelector((state) =>
    state.countries.favorites.includes(cca3),
  );
  const allCountries = useAppSelector((state) => state.countries.countries);

  const borderCountries = useMemo(
    () =>
      (country?.borders ?? [])
        .map((code) => allCountries.find((c) => c.cca3 === code))
        .filter(Boolean),
    [country?.borders, allCountries],
  );

  const handleFavorite = useCallback(
    () => dispatch(toggleFavorite(cca3)),
    [dispatch, cca3],
  );

  const handleBorderPress = useCallback(
    (borderCca3: string) => navigation.push('CountryDetail', { cca3: borderCca3 }),
    [navigation],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0],
            [2, 1],
            Extrapolation.EXTEND
          ),
        },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT / 2],
        [0.1, 0.7],
        Extrapolation.CLAMP
      ),
    };
  });

  if (!country) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <Image
          source={{ uri: country.flags.png.replace('w320', 'w1280') }}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
        />
        <Animated.View style={[styles.imageOverlay, overlayStyle, { backgroundColor: colors.background }]} />
      </Animated.View>

      {/* Transparent back button — floats over the hero image */}
      <Header
        variant="transparent"
        onBack={() => navigation.goBack()}
      />

      <Animated.ScrollView
        testID="detail-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 60 }}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(16)}>
          <View style={[styles.contentPanel, { backgroundColor: colors.surface }]}>

            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

            <View style={styles.titleRow}>
              <View style={styles.titleTextContainer}>
                <Text testID="country-name" style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                  {country.name.common}
                </Text>
                <Text style={[styles.officialName, { color: colors.textSecondary }]}>
                  {country.name.official}
                </Text>
              </View>
              <TouchableOpacity
                testID={isFavorite ? 'favorite-btn-active' : 'favorite-btn-inactive'}
                onPress={handleFavorite}
                style={[
                  styles.favBtn,
                  {
                    backgroundColor: isFavorite ? colors.favorite : 'transparent',
                    borderWidth: 1.5,
                    borderColor: isFavorite ? colors.favorite : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} color={isFavorite ? '#FFF' : colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.quickStatsRow, { backgroundColor: colors.background }]}>
              <View style={styles.statBox}>
                <Ionicons name="people" size={20} color={colors.accent} />
                <Text testID="stat-population" style={[styles.statValue, { color: colors.text }]}>{formatPopulation(country.population)}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Population</Text>
              </View>
              <View style={[styles.statBoxBorder, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Ionicons name="earth" size={20} color={colors.accent} />
                <Text testID="stat-region" style={[styles.statValue, { color: colors.text }]}>{country.region}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Region</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Geography & Culture</Text>
            </View>

            <View style={styles.detailsList}>
              <InfoRow icon="business" label="Capital" value={getCapital(country.capital)} />
              <InfoRow icon="language" label="Languages" value={getLanguagesList(country.languages)} />
              <InfoRow icon="cash" label="Currencies" value={getCurrencyList(country.currencies)} isLast />
            </View>

            {borderCountries.length > 0 && (
              <View style={styles.bordersSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Shares Borders With</Text>
                </View>
                <View style={styles.bordersRow}>
                  {borderCountries.map((border) => (
                    <TouchableOpacity
                      key={border!.cca3}
                      testID={`border-chip-${border!.cca3}`}
                      style={[
                        styles.borderChip,
                        {
                          backgroundColor: colors.borderChipBg,
                          borderColor: colors.borderChipBorder,
                        },
                      ]}
                      onPress={() => handleBorderPress(border!.cca3)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: border!.flags.png }} style={styles.borderFlag} resizeMode="cover" />
                      <Text style={[styles.borderChipText, { color: colors.borderChipText }]}>
                        {border!.name.common}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, isLast = false }: { icon: any; label: string; value: string; isLast?: boolean }) {
  const colors = useTheme();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }, isLast && styles.noBorder]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.accentMuted }]}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentPanel: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    minHeight: height - (HEADER_HEIGHT - 60),
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  name: { fontSize: 36, fontWeight: '800', letterSpacing: -1.2, lineHeight: 42, marginBottom: 6 },
  officialName: { fontSize: 16, letterSpacing: -0.2, fontWeight: '500' },
  favBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickStatsRow: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 36,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBoxBorder: {
    width: 1,
    height: 40,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  detailsList: {
    marginBottom: 36,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noBorder: { borderBottomWidth: 0 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bordersSection: {
    marginTop: 10,
  },
  bordersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  borderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 8,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  borderFlag: {
    width: 28,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  borderChipText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bottomSpacer: {
    height: 60,
  },
});
