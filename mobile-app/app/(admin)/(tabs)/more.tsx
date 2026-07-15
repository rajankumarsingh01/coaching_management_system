import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { PressableCard } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

const MENU_ITEMS = [
  { icon: '📚', label: 'Batches', route: '/(admin)/batches' },
  { icon: '👨‍🏫', label: 'Assign Teacher to All Batches', route: '/(admin)/assign-teacher-all' },
  { icon: '📝', label: 'Notes & Lectures', route: '/(admin)/content-batches' },
  { icon: '🧪', label: 'Tests & Quizzes', route: '/(admin)/test-batches' },
  { icon: '📋', label: 'Homework', route: '/(admin)/homework-batches' },
  { icon: '🗓️', label: 'Calendar', route: '/(admin)/calendar-events' },
  { icon: '🖌️', label: 'Institute Branding', route: '/(admin)/branding-settings' },
  { icon: '🎨', label: 'Poster Generator', route: '/(admin)/poster-generator' },
  { icon: '⚙️', label: 'Settings / भाषा बदलें', route: '/(admin)/settings' },
  { icon: '🏫', label: 'About Institute', route: '/(admin)/about' },
  { icon: '💰', label: 'Salaries', route: '/(admin)/salaries' },
] as const;

export default function AdminMoreScreen() {
  const { user, logout } = useAuth();
  const colors = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="More" tagline={user?.name ? `Signed in as ${user.name}` : 'Settings & tools'} />

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <PressableCard
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{item.label}</Text>
              <Text style={{ color: colors.textFaint }}>›</Text>
            </View>
          </PressableCard>
        ))}
      </View>

      <View style={styles.logoutWrap}>
        <Button label="Logout" variant="danger" onPress={logout} fullWidth />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menu: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  menuItem: { paddingVertical: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIcon: { fontSize: 20 },
  logoutWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xxxl },
});