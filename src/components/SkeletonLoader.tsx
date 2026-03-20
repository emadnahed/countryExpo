import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const CARD_COUNT = 4;

export function SkeletonLoader() {
  const colors = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View testID="skeleton-loader" style={[styles.container, { backgroundColor: colors.background }]}>
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <Animated.View
          key={i}
          testID="skeleton-card"
          style={[styles.card, { backgroundColor: colors.surface, shadowColor: '#000' }, animatedStyle]}
        >
          {/* Flag placeholder — full width, same height as CountryCard flag */}
          <View style={[styles.flagPlaceholder, { backgroundColor: colors.skeleton }]} />

          {/* Info row — name line + detail line */}
          <View style={styles.infoContainer}>
            <View style={[styles.line, styles.nameLine, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.line, styles.detailLine, { backgroundColor: colors.skeleton }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  flagPlaceholder: {
    width: '100%',
    height: 180,
  },
  infoContainer: {
    padding: 20,
    paddingTop: 16,
    gap: 10,
  },
  line: {
    borderRadius: 8,
  },
  nameLine: {
    height: 16,
    width: '55%',
  },
  detailLine: {
    height: 12,
    width: '40%',
  },
});
