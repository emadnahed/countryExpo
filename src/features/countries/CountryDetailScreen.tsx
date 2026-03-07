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
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CountryDetail'>;

export function CountryDetailScreen({ route, navigation }: Props) {
  const { cca3 } = route.params;
  const dispatch = useAppDispatch();

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Image
          source={{ uri: country.flags.png }}
          style={styles.flag}
          resizeMode="cover"
          accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{country.name.common}</Text>
            <TouchableOpacity onPress={handleFavorite} style={styles.favBtn}>
              <Text style={styles.favIcon}>{isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.officialName}>{country.name.official}</Text>

          <View style={styles.section}>
            <InfoRow label="Capital" value={getCapital(country.capital)} />
            <InfoRow label="Region" value={country.region} />
            <InfoRow label="Population" value={formatPopulation(country.population)} />
            <InfoRow label="Languages" value={getLanguagesList(country.languages)} />
            <InfoRow label="Currencies" value={getCurrencyList(country.currencies)} />
          </View>

          {borderCountries.length > 0 && (
            <View style={styles.bordersSection}>
              <Text style={styles.bordersTitle}>Border Countries</Text>
              <View style={styles.bordersRow}>
                {borderCountries.map((border) => (
                  <TouchableOpacity
                    key={border!.cca3}
                    style={styles.borderChip}
                    onPress={() => handleBorderPress(border!.cca3)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.borderChipText}>{border!.name.common}</Text>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flag: { width: '100%', height: 220 },
  content: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 26, fontWeight: '800', color: '#111', flex: 1 },
  officialName: { fontSize: 14, color: '#777', marginBottom: 20, fontStyle: 'italic' },
  favBtn: { padding: 8 },
  favIcon: { fontSize: 28, color: '#FFB300' },
  section: { gap: 12 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  infoLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  infoValue: { fontSize: 14, color: '#555', flex: 1 },
  bordersSection: { marginTop: 24 },
  bordersTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  bordersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  borderChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#c5d0f5',
  },
  borderChipText: { fontSize: 13, color: '#2c5ef5', fontWeight: '500' },
});
