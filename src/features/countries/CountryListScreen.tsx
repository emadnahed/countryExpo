import React, { useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
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
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CountryList'>;

export function CountryListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { filteredCountries, loading, error, searchQuery, selectedRegion } =
    useAppSelector((state) => state.countries);

  useEffect(() => {
    dispatch(fetchCountries());
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

  const handleMapPress = useCallback(
    () => navigation.navigate('Map'),
    [navigation],
  );

  const keyExtractor = useCallback((item: Country) => item.cca3, []);

  const renderItem: ListRenderItem<Country> = useCallback(
    ({ item }) => (
      <CountryCard country={item} onPress={() => handlePress(item.cca3)} />
    ),
    [handlePress],
  );

  if (loading && filteredCountries.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading countries...</Text>
      </View>
    );
  }

  if (error && filteredCountries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <RegionFilter
        selectedRegion={selectedRegion}
        onRegionSelect={handleRegionFilter}
      />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  list: { paddingVertical: 8 },
  loadingText: { color: '#555', fontSize: 14 },
  errorText: { color: '#e53935', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
});
