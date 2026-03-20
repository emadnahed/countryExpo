import React, { memo, useCallback, useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(0.88, { duration: 120 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 220 });
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
      >
        {/* ── Flag image with region badge overlay ── */}
        <View style={[styles.flagWrapper, { backgroundColor: colors.skeleton }]}>
          {!imgError ? (
            <>
              <Image
                source={{ uri: country.flags.png.replace('w320', 'w640') }}
                style={styles.flag}
                resizeMode="cover"
                accessibilityLabel={country.flags.alt ?? `Flag of ${country.name.common}`}
                onError={() => setImgError(true)}
              />
              {/* Region context badge — bottom-left over the flag */}
              <View style={[styles.regionBadge, { backgroundColor: colors.badgeOverlay }]}>
                <Text style={[styles.regionBadgeText, { color: colors.onAccent }]}>{country.region}</Text>
              </View>
            </>
          ) : (
            <View style={styles.flagFallback}>
              <Ionicons name="flag-outline" size={32} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* ── Country info ── */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {country.name.common}
          </Text>
          <View style={styles.detailsRow}>
            <Ionicons name="people-outline" size={13} color={colors.textSecondary} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatPopulation(country.population)}
            </Text>
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
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
  },
  flagWrapper: {
    width: '100%',
    height: 180,
  },
  flag: {
    width: '100%',
    height: 180,
  },
  flagFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  regionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 5,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
