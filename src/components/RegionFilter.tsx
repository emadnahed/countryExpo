import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

interface Props {
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
}

export const RegionFilter = memo(({ selectedRegion, onRegionSelect }: Props) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    <Chip
      label="All"
      selected={selectedRegion === null}
      onPress={() => onRegionSelect(null)}
    />
    {REGIONS.map((region) => (
      <Chip
        key={region}
        label={region}
        selected={selectedRegion === region}
        onPress={() => onRegionSelect(region === selectedRegion ? null : region)}
      />
    ))}
  </ScrollView>
));

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
