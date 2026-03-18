import React, { memo, useCallback } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

interface Props {
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  counts: Record<string, number>;
}

export const RegionFilter = memo(function RegionFilter({ selectedRegion, onRegionSelect, counts }: Props) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <ScrollView
      testID="region-filter-scroll"
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Chip
        testID="region-chip-all"
        label={totalCount > 0 ? `All · ${totalCount}` : 'All'}
        selected={selectedRegion === null}
        onPress={() => onRegionSelect(null)}
      />
      {REGIONS.map((region) => {
        const count = counts[region];
        return (
          <Chip
            key={region}
            testID={`region-chip-${region.toLowerCase()}`}
            label={count != null ? `${region} · ${count}` : region}
            selected={selectedRegion === region}
            onPress={() => onRegionSelect(region === selectedRegion ? null : region)}
          />
        );
      })}
    </ScrollView>
  );
});

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

function Chip({ label, selected, onPress, testID }: ChipProps) {
  const colors = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 12, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={testID}
        style={[
          styles.chip,
          { backgroundColor: colors.surface, borderColor: 'transparent' },
          selected && { backgroundColor: colors.text, borderColor: colors.text },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text
          style={[
            styles.chipText,
            { color: colors.textSecondary },
            selected && { color: colors.surface },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    height: 70,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
