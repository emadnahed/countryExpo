import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

interface Props {
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
}

export const RegionFilter = memo(({ selectedRegion, onRegionSelect }: Props) => {
  const colors = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Chip
        label="All"
        selected={selectedRegion === null}
        onPress={() => onRegionSelect(null)}
        colors={colors}
      />
      {REGIONS.map((region) => (
        <Chip
          key={region}
          label={region}
          selected={selectedRegion === region}
          onPress={() => onRegionSelect(region === selectedRegion ? null : region)}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
});

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>;
}

function Chip({ label, selected, onPress, colors }: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: colors.inputBg, borderColor: colors.border },
        selected && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          { color: colors.textSecondary },
          selected && { color: '#fff' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    // Explicit height prevents the horizontal ScrollView from being
    // vertically compressed by the parent flex layout, which clips chips
    height: 60,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
