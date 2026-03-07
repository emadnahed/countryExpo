import React, { memo, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Country } from '@/features/countries/countriesSlice';
import { formatPopulation } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  country: Country;
  onPress: () => void;
}

function CountryCardComponent({ country, onPress }: Props) {
  const colors = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <Image
          source={{ uri: country.flags.png }}
          style={styles.flag}
          resizeMode="cover"
          accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {country.name.common}
          </Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            <Text style={[styles.label, { color: colors.text }]}>Population: </Text>
            {formatPopulation(country.population)}
          </Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            <Text style={[styles.label, { color: colors.text }]}>Region: </Text>
            {country.region}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const CountryCard = memo(CountryCardComponent);

const styles = StyleSheet.create({
  card: {
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
  pressable: {
    flexDirection: 'row',
  },
  // 3:2 aspect ratio for standard flag proportions
  flag: {
    width: 110,
    aspectRatio: 3 / 2,
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
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
  },
  label: {
    fontWeight: '600',
  },
});
