// src/components/ui/ScreenHeader.tsx

import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, typography, radius } from '../../theme/tokens';

type ScreenHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function ScreenHeader({ title, tagline, bannerUrl, rightLabel, onRightPress }: ScreenHeaderProps) {
  const colors = useThemeColors();

  return (
    <View>
      {bannerUrl ? (
        <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
      ) : (
        // Even with no banner image uploaded yet, show a brand-colored strip
        // so the header never looks unbranded/broken.
        <View style={[styles.banner, styles.bannerFallback, { backgroundColor: colors.primaryMuted }]} />
      )}

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[typography.h1, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {tagline ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]} numberOfLines={1}>
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
  banner: { width: '100%', height: 120 },
  bannerFallback: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
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