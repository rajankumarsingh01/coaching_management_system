import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useAuth } from '../../../src/context/AuthContext';
import axiosInstance from '../../../src/api/axiosInstance';
import { ProfileAvatarEditor } from '../../../src/components/ProfileAvatarEditor';

export default function ParentProfileScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { user, logout, updateUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(user?.avatarUrl);

  useFocusEffect(
    useCallback(() => {
      axiosInstance
        .get('/users/me')
        .then(({ data }) => setAvatarUrl(data.data.avatarUrl))
        .catch((err) => console.error('Failed to load profile', err));
    }, [])
  );

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
    updateUser({ avatarUrl: url });
  };

  const menuItems = [
    { label: 'About Institute', icon: 'school-outline' as const, onPress: () => {} },
    { label: 'Settings', icon: 'settings-outline' as const, onPress: () => {} },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={user?.name ?? 'Profile'}
        tagline={user?.email}
        bannerUrl={branding.bannerImageUrl || undefined}
        logoUrl={branding.logoUrl || undefined}
      />

      <View style={styles.avatarWrap}>
        <ProfileAvatarEditor avatarUrl={avatarUrl} name={user?.name} onChange={handleAvatarChange} />
      </View>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <PressableCard key={item.label} style={styles.menuRow} onPress={item.onPress}>
            <Ionicons name={item.icon} size={20} color={colors.text} />
            <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </PressableCard>
        ))}

        <TouchableOpacity style={[styles.logout, { backgroundColor: colors.dangerBg }]} onPress={logout}>
          <Text style={[typography.bodyMedium, { color: colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginTop: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  logout: { padding: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.lg },
});