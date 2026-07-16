import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';
import { useBranding } from '../../../src/context/BrandingContext';
import { useAuth } from '../../../src/context/AuthContext';

export default function ParentProfileScreen() {
  const colors = useThemeColors();
  const { branding } = useBranding();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'About Institute', icon: 'school-outline' as const, onPress: () => {} },
    { label: 'Settings', icon: 'settings-outline' as const, onPress: () => {} },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={user?.name ?? 'Profile'} tagline={user?.email} bannerUrl={branding.bannerImageUrl || undefined} logoUrl={branding.logoUrl || undefined} />
      <View style={styles.content}>
        {menuItems.map((item) => (
          <PressableCard key={item.label} style={styles.menuRow} onPress={item.onPress}>
            <Ionicons name={item.icon} size={20} color={colors.text} />
            <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>{item.label}</Text>
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
  content: { padding: spacing.lg, gap: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  logout: { padding: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.lg },
});