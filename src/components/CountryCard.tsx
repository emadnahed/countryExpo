import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Country } from '@/features/countries/countriesSlice';
import { formatPopulation } from '@/utils/helpers';

interface Props {
  country: Country;
  onPress: () => void;
}

export const CountryCard = memo(({ country, onPress }: Props) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Image
      source={{ uri: country.flags.png }}
      style={styles.flag}
      resizeMode="cover"
      accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
    />
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>
        {country.name.common}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Population: </Text>
        {formatPopulation(country.population)}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Region: </Text>
        {country.region}
      </Text>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flag: {
    width: 90,
    height: 70,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    color: '#555',
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
});
