import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, typography } from '../../theme/tokens';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

type MenuSectionProps = {
  title: string;
  items: readonly MenuItem[];
};

// Groups related menu items under one labeled section, inside a single
// card with divider rows — replaces the old pattern of one separate card
// per item, which made a 12-item menu look like an undifferentiated dump
// rather than an organized set of tools.
export function MenuSection({ title, items }: MenuSectionProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[typography.label, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
      <Card padded={false} style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.row,
              index < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            activeOpacity={0.6}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name={item.icon} size={17} color={colors.primary} />
            </View>
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  card: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});