import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
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

type Props = NativeStackScreenProps<RootStackParamList, 'CountryList'>;

export function CountryListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { filteredCountries, loading, error, searchQuery, selectedRegion, countries } =
    useAppSelector((state) => state.countries);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Map')}
          style={styles.mapBtn}
          accessibilityLabel="Open world map"
        >
          <Ionicons name="map-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of countries) {
      counts[c.region] = (counts[c.region] ?? 0) + 1;
    }
    return counts;
  }, [countries]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    countriesService.clearCache();
    await dispatch(fetchCountries());
    setRefreshing(false);
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
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <RegionFilter
        selectedRegion={selectedRegion}
        onRegionSelect={handleRegionFilter}
        counts={regionCounts}
      />
      {loading && filteredCountries.length === 0 ? (
        <SkeletonLoader />
      ) : (
        <FlatList
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
  list: { paddingVertical: 8 },
  errorText: { fontSize: 14, textAlign: 'center' },
  mapBtn: { marginRight: 4, padding: 4 },
});
