// src/components/ui/StatCard.tsx

import { Text, View, StyleSheet } from 'react-native';
import { PressableCard } from './Card';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, typography } from '../../theme/tokens';

type Tone = 'brand' | 'success' | 'danger' | 'warning' | 'neutral';

type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
  icon?: string;
  tone?: Tone;
  onPress?: () => void;
  compact?: boolean;
};

export function StatCard({ label, value, subtext, icon, tone = 'brand', onPress, compact = false }: StatCardProps) {
  const colors = useThemeColors();

  const toneColor: Record<Tone, string> = {
    brand: colors.primary,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    neutral: colors.text,
  };

  if (compact) {
    return (
      <PressableCard onPress={onPress} style={styles.compactCard}>
        {icon ? <Text style={styles.compactIcon}>{icon}</Text> : null}
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{label}</Text>
      </PressableCard>
    );
  }

  return (
    <PressableCard onPress={onPress}>
      <View style={styles.row}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[typography.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
      <Text style={[typography.stat, { color: toneColor[tone], marginTop: spacing.xs }]}>{value}</Text>
      {subtext ? (
        <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>{subtext}</Text>
      ) : null}
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 15, marginRight: spacing.sm },
  compactCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  compactIcon: { fontSize: 22, marginBottom: spacing.xs },
});