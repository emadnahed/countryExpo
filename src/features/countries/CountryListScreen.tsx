import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCountries,
  setSearchQuery,
  setRegionFilter,
  type Country,
} from './countriesSlice';
import { CountryCard } from '@/components/CountryCard';
import { SearchBar } from '@/components/SearchBar';
import { RegionFilter } from '@/components/RegionFilter';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { countriesService } from './countriesService';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { Header } from '@/components/Header';

type Props = NativeStackScreenProps<RootStackParamList, 'CountryList'>;

export function CountryListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { filteredCountries, loading, error, searchQuery, selectedRegion, countries } =
    useAppSelector((state) => state.countries);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const regionCounts = useMemo(() => {
    return countries.reduce<Record<string, number>>((counts, country) => {
      counts[country.region] = (counts[country.region] ?? 0) + 1;
      return counts;
    }, {});
  }, [countries]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      countriesService.clearCache();
      await dispatch(fetchCountries());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleSearch = useCallback(
    (q: string) => dispatch(setSearchQuery(q)),
    [dispatch],
  );

  const handleRegionFilter = useCallback(
    (region: string | null) => dispatch(setRegionFilter(region)),
    [dispatch],
  );

  const handlePress = useCallback(
    (cca3: string) => navigation.navigate('CountryDetail', { cca3 }),
    [navigation],
  );

  const keyExtractor = useCallback((item: Country) => item.cca3, []);

  const renderItem: ListRenderItem<Country> = useCallback(
    ({ item }) => (
      <CountryCard country={item} onPress={() => handlePress(item.cca3)} />
    ),
    [handlePress],
  );

  if (error && filteredCountries.length === 0) {
    return (
      <View testID="error-view" style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="wifi-outline" size={52} color={colors.textMuted} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Couldn't load countries</Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
          Check your connection and pull to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Country Explorer"
        rightAction={{
          icon: 'map-outline',
          onPress: () => navigation.navigate('Map'),
          accessibilityLabel: 'Open world map',
          testID: 'map-btn',
        }}
      />
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <RegionFilter
        selectedRegion={selectedRegion}
        onRegionSelect={handleRegionFilter}
        counts={regionCounts}
      />
      {loading && filteredCountries.length === 0 ? (
        <SkeletonLoader />
      ) : filteredCountries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={52} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No countries found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Try a different search or region
          </Text>
        </View>
      ) : (
        <FlatList
          testID="country-list"
          data={filteredCountries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { paddingVertical: 12, paddingBottom: 60 },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
