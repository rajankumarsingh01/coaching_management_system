// src/components/ui/StatCard.tsx

import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

// Maps the emoji values already used across the app to a proper Ionicons
// name, so every existing call site (StatCard label="..." icon="💰" ...)
// keeps working unchanged — this file is the only thing that needed to
// change. Any emoji NOT in this map falls back to rendering as-is, so a
// missed/new one degrades safely instead of breaking.
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  '💰': 'cash-outline',
  '📄': 'document-outline',
  '⏳': 'hourglass-outline',
  '⚠️': 'alert-circle-outline',
  '📊': 'bar-chart-outline',
  '📝': 'create-outline',
  '🎓': 'school-outline',
  '🧑‍🏫': 'easel-outline',
  '📚': 'library-outline',
  '💼': 'briefcase-outline',
  '🤝': 'hand-left-outline',
  '✅': 'checkmark-circle-outline',
  '🗓️': 'calendar-outline',
};

function StatIcon({ icon, color, size }: { icon: string; color: string; size: number }) {
  const mapped = ICON_MAP[icon];
  if (mapped) return <Ionicons name={mapped} size={size} color={color} />;
  // Unmapped emoji — render as-is rather than breaking.
  return <Text style={{ fontSize: size }}>{icon}</Text>;
}

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
        {icon ? (
          <View style={styles.compactIconWrap}>
            <StatIcon icon={icon} color={toneColor[tone]} size={22} />
          </View>
        ) : null}
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{label}</Text>
      </PressableCard>
    );
  }

  return (
    <PressableCard onPress={onPress}>
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
            <StatIcon icon={icon} color={toneColor[tone]} size={15} />
          </View>
        ) : null}
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
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  compactCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  compactIconWrap: { marginBottom: spacing.xs },
});