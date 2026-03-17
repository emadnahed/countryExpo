import React, { useCallback } from 'react';
import { StyleSheet, Platform, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const countries = useAppSelector((state) => state.countries.countries);
  const colors = useTheme();

  const handleMarkerPress = useCallback(
    (cca3: string) => navigation.navigate('CountryDetail', { cca3 }),
    [navigation],
  );

  if (countries.length === 0) {
    return (
      <View testID="map-empty" style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No countries loaded yet.</Text>
      </View>
    );
  }

  return (
    <MapView
      testID="map-view"
      style={StyleSheet.absoluteFillObject}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      initialRegion={{
        latitude: 20,
        longitude: 0,
        latitudeDelta: 120,
        longitudeDelta: 120,
      }}
    >
      {countries
        .filter((c) => c.latlng?.length === 2)
        .map((country) => (
          <Marker
            key={country.cca3}
            coordinate={{
              latitude: country.latlng[0],
              longitude: country.latlng[1],
            }}
            title={country.name.common}
            description={country.region}
            onCalloutPress={() => handleMarkerPress(country.cca3)}
          />
        ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#777' },
});
