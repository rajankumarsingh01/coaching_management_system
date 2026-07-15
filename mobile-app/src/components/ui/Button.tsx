// src/components/ui/Button.tsx

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, radius, typography } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const colors = useThemeColors();

  const variantStyles: Record<Variant, { bg: string; border?: string; text: string }> = {
    primary: { bg: colors.primary, text: colors.onPrimary },
    secondary: { bg: colors.primaryMuted, text: colors.primary },
    outline: { bg: 'transparent', border: colors.border, text: colors.text },
    danger: { bg: colors.dangerBg, text: colors.danger },
    ghost: { bg: 'transparent', text: colors.primary },
  };
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        size === 'sm' && styles.baseSm,
        {
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[typography.bodyMedium, { color: v.text }, size === 'sm' && styles.textSm]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  textSm: {
    fontSize: 13,
  },
});