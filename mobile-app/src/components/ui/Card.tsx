// src/components/ui/Card.tsx
//
// Replaces the copy-pasted `styles.card` block that existed in nearly
// every screen (border: 1px #e5e7eb, radius 12, padding 16-20).

import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing, radius, shadow } from '../../theme/tokens';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ children, style, padded = true, elevated = false }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
        },
        elevated && shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type PressableCardProps = CardProps & Pick<TouchableOpacityProps, 'onPress' | 'disabled'>;

// Same visual as Card but pressable — most dashboard tiles navigate
// somewhere on tap, so this is the more commonly used variant in practice.
export function PressableCard({ children, style, padded = true, elevated = false, onPress, disabled }: PressableCardProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
          opacity: disabled ? 0.5 : 1,
        },
        elevated && shadow.card,
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
  },
});