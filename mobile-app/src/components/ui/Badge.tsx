// src/components/ui/Badge.tsx

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, radius, typography } from '../../theme/tokens';

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const colors = useThemeColors();

  const toneMap: Record<Tone, { bg: string; text: string }> = {
    success: { bg: colors.successBg, text: colors.success },
    danger: { bg: colors.dangerBg, text: colors.danger },
    warning: { bg: colors.warningBg, text: colors.warning },
    info: { bg: colors.infoBg, text: colors.info },
    neutral: { bg: colors.surface, text: colors.textMuted },
  };
  const t = toneMap[tone];

  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text style={[typography.caption, { color: t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});