// src/components/ui/ScreenHeader.tsx

import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, typography, radius } from '../../theme/tokens';

type ScreenHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  logoUrl?: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function ScreenHeader({ title, tagline, bannerUrl, logoUrl, rightLabel, onRightPress }: ScreenHeaderProps) {
  const colors = useThemeColors();

  // No banner uploaded yet — don't fake one with an empty colored box.
  // A clean, compact header (no dead space) reads far more finished than
  // a placeholder strip with nothing in it.
  if (!bannerUrl) {
    return (
      <View style={[styles.plainHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={[typography.h1, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {tagline ? (
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
                {tagline}
              </Text>
            ) : null}
          </View>
          {rightLabel ? (
            <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[typography.label, { color: colors.danger }]}>{rightLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
      </View>
    );
  }

  // Real banner exists — render it properly, with a bottom gradient scrim
  // so overlaid text always stays legible regardless of the source image's
  // own colors/content (fixes banners with busy text/graphics baked in).
  return (
    <View>
      <View style={styles.bannerWrap}>
        <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.55)']}
          style={StyleSheet.absoluteFillObject}
        />
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={[styles.logo, { borderColor: colors.background }]} />
        ) : null}
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[typography.h1, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {tagline ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
              {tagline}
            </Text>
          ) : null}
        </View>
        {rightLabel ? (
          <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[typography.label, { color: colors.danger }]}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plainHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  accentBar: {
    height: 3,
    width: 36,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  bannerWrap: {
    width: '100%',
    height: 140,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  banner: { width: '100%', height: '100%' },
  logo: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: { flex: 1, marginRight: spacing.md },
});