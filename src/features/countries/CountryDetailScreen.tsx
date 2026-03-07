import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import type { AppColors } from '@/utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CountryDetail'>;

export function CountryDetailScreen({ route, navigation }: Props) {
  const { cca3 } = route.params;
  const dispatch = useAppDispatch();
  const colors = useTheme();

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

  if (!country) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        {/* Flag with correct 3:2 aspect ratio */}
        <Image
          source={{ uri: country.flags.png }}
          style={styles.flag}
          resizeMode="cover"
          accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              {country.name.common}
            </Text>
            <TouchableOpacity onPress={handleFavorite} style={styles.favBtn}>
              <Text style={styles.favIcon}>{isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.officialName, { color: colors.textSecondary }]}>
            {country.name.official}
          </Text>

          <View style={styles.section}>
            <InfoRow label="Capital" value={getCapital(country.capital)} colors={colors} />
            <InfoRow label="Region" value={country.region} colors={colors} />
            <InfoRow label="Population" value={formatPopulation(country.population)} colors={colors} />
            <InfoRow label="Languages" value={getLanguagesList(country.languages)} colors={colors} />
            <InfoRow label="Currencies" value={getCurrencyList(country.currencies)} colors={colors} />
          </View>

          {borderCountries.length > 0 && (
            <View style={styles.bordersSection}>
              <Text style={[styles.bordersTitle, { color: colors.text }]}>
                Border Countries
              </Text>
              <View style={styles.bordersRow}>
                {borderCountries.map((border) => (
                  <TouchableOpacity
                    key={border!.cca3}
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
                    <Text style={[styles.borderChipText, { color: colors.borderChipText }]}>
                      {border!.name.common}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: AppColors;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>{label}:</Text>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Full-width flag with correct 3:2 aspect ratio
  flag: { width: '100%', aspectRatio: 3 / 2 },
  content: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 26, fontWeight: '800', flex: 1 },
  officialName: { fontSize: 14, marginBottom: 20, fontStyle: 'italic' },
  favBtn: { padding: 8 },
  favIcon: { fontSize: 28, color: '#FFB300' },
  section: { gap: 12 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  infoLabel: { fontSize: 14, fontWeight: '700' },
  infoValue: { fontSize: 14, flex: 1 },
  bordersSection: { marginTop: 24 },
  bordersTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  bordersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  borderChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  borderChipText: { fontSize: 13, fontWeight: '500' },
});
