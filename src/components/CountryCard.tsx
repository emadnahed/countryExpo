import React, { memo, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 150 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 250 });
  }, [scale, opacity]);

  return (
    <Animated.View
      testID={`country-card-${country.cca3}`}
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: '#000' },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={[styles.flagWrapper, { borderBottomColor: colors.border }]}>
          <Image
            source={{ uri: country.flags.png.replace('w320', 'w640') }}
            style={styles.flag}
            resizeMode="cover"
            accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {country.name.common}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {formatPopulation(country.population)}
              </Text>
            </View>
            <Text style={[styles.detailDot, { color: colors.border }]}>  •  </Text>
            <View style={styles.detailItem}>
              <Ionicons name="earth-outline" size={14} color={colors.textSecondary} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {country.region}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const CountryCard = memo(CountryCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  pressable: {
    flexDirection: 'column',
  },
  flagWrapper: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flag: {
    width: '100%',
    height: 180,
  },
  infoContainer: {
    padding: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  detailDot: {
    fontSize: 14,
    lineHeight: 14,
  },
});
