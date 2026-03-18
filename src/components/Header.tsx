import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

// ─── Public types ─────────────────────────────────────────────────────────────

export type HeaderVariant = 'solid' | 'glass' | 'transparent';

export interface HeaderAction {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: HeaderAction;
  /**
   * solid       — opaque background, sits in document flow  (CountryList)
   * glass       — frosted-glass pills, floats over the map  (MapScreen)
   * transparent — barely-there circles, floats over a hero  (CountryDetail)
   */
  variant?: HeaderVariant;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Header({
  title,
  onBack,
  rightAction,
  variant = 'solid',
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const isDark = useColorScheme() === 'dark';

  // ── Solid ────────────────────────────────────────────────────────────────────
  if (variant === 'solid') {
    // Always render both side slots (real button or invisible placeholder) so
    // the title is pixel-perfectly centred on iOS and Android alike.
    const leftSlot = onBack ? (
      <TouchableOpacity
        style={[styles.solidBtn, { backgroundColor: colors.inputBg }]}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID="back-btn"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>
    ) : (
      <View style={styles.solidPlaceholder} />
    );

    const rightSlot = rightAction ? (
      <TouchableOpacity
        style={[styles.solidBtn, { backgroundColor: colors.inputBg }]}
        onPress={rightAction.onPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID={rightAction.testID}
        accessibilityLabel={rightAction.accessibilityLabel}
      >
        <Ionicons name={rightAction.icon} size={22} color={colors.text} />
      </TouchableOpacity>
    ) : (
      <View style={styles.solidPlaceholder} />
    );

    return (
      <View
        style={[styles.solidWrap, { paddingTop: insets.top + 4, backgroundColor: colors.background }]}
        testID={testID}
      >
        <View style={styles.solidRow}>
          {leftSlot}
          <Text style={[styles.solidTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {rightSlot}
        </View>
      </View>
    );
  }

  // ── Floating (glass / transparent) ───────────────────────────────────────────
  const bg = variant === 'glass'
    ? (isDark ? 'rgba(12,12,12,0.82)' : 'rgba(255,255,255,0.90)')
    : (isDark ? 'rgba(0,0,0,0.45)'   : 'rgba(255,255,255,0.78)');

  const border = variant === 'glass'
    ? (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
    : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)');

  // colors.text (#1D1D1F light / #F5F5F7 dark) always reads well against the
  // semi-transparent circle backgrounds used by both glass and transparent variants.
  const iconColor = colors.text;

  // Whether we need side placeholders to visually centre the title pill
  const needsLeftPlaceholder  = !onBack && !!title;
  const needsRightPlaceholder = !rightAction && !!title;

  return (
    <View style={[styles.floatRow, { top: insets.top + 8 }]} testID={testID}>

      {/* ── Left slot ── */}
      {onBack ? (
        <TouchableOpacity
          style={[styles.floatCircle, { backgroundColor: bg, borderColor: border }]}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="back-btn"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={iconColor} />
        </TouchableOpacity>
      ) : needsLeftPlaceholder ? (
        <View style={styles.floatPlaceholder} />
      ) : null}

      {/* ── Centre slot ── */}
      {title ? (
        <View style={[styles.floatTitlePill, { backgroundColor: bg, borderColor: border }]}>
          <Text style={[styles.floatTitleText, { color: iconColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : (
        // no title — just absorb remaining space so side buttons stay pinned
        <View style={styles.floatSpacer} />
      )}

      {/* ── Right slot ── */}
      {rightAction ? (
        <TouchableOpacity
          style={[styles.floatCircle, { backgroundColor: bg, borderColor: border }]}
          onPress={rightAction.onPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={rightAction.testID}
          accessibilityLabel={rightAction.accessibilityLabel}
        >
          <Ionicons name={rightAction.icon} size={20} color={iconColor} />
        </TouchableOpacity>
      ) : needsRightPlaceholder ? (
        <View style={styles.floatPlaceholder} />
      ) : null}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const floatShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.10,
  shadowRadius: 10,
  elevation: 5,
} as const;

const styles = StyleSheet.create({
  // Solid (in document flow)
  solidWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  solidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 10,
  },
  solidBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidPlaceholder: {
    width: 44,
    height: 44,
  },
  solidTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },

  // Floating (glass / transparent)
  floatRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  floatCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...floatShadow,
  },
  floatPlaceholder: {
    width: 44,
    height: 44,
  },
  floatTitlePill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...floatShadow,
  },
  floatTitleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  floatSpacer: {
    flex: 1,
  },
});
