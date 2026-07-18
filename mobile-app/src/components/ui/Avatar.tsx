// src/components/ui/Avatar.tsx
//
// Profile picture ho to image dikhati hai, na ho to naam ke initials
// wala colored circle fallback dikhati hai (kabhi bhi khaali/broken
// image icon nahi dikhta).

import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: number;
};

function getInitials(name?: string) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

export function Avatar({ uri, name, size = 72 }: AvatarProps) {
  const colors = useThemeColors();
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dim]} />;
  }

  return (
    <View style={[styles.fallback, dim, { backgroundColor: colors.primaryMuted }]}>
      <Text style={[styles.initials, { color: colors.primary, fontSize: size * 0.36 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});