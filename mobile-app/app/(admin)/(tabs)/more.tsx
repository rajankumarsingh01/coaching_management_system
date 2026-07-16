import { ScrollView, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { MenuSection } from '../../../src/components/ui/MenuSection';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing } from '../../../src/theme/tokens';

export default function AdminMoreScreen() {
  const { user, logout } = useAuth();
  const colors = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="More" tagline={user?.name ? `Signed in as ${user.name}` : 'Settings & tools'} />

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <MenuSection
          title="Academics"
          items={[
            { label: 'Batches', icon: 'library-outline', route: '/(admin)/batches' },
            { label: 'Notes & Lectures', icon: 'document-text-outline', route: '/(admin)/content-batches' },
            { label: 'Tests & Quizzes', icon: 'flask-outline', route: '/(admin)/test-batches' },
            { label: 'Homework', icon: 'clipboard-outline', route: '/(admin)/homework-batches' },
            { label: 'Weak Topics', icon: 'analytics-outline', route: '/(admin)/weak-topics-batches' },
          ]}
        />

        <MenuSection
          title="Staff & Schedule"
          items={[
            { label: 'Assign Teacher to All Batches', icon: 'person-add-outline', route: '/(admin)/assign-teacher-all' },
            { label: 'Calendar', icon: 'calendar-outline', route: '/(admin)/calendar-events' },
            { label: 'Salaries', icon: 'wallet-outline', route: '/(admin)/salaries' },
          ]}
        />

        <MenuSection
          title="Branding & Marketing"
          items={[
            { label: 'Institute Branding', icon: 'color-palette-outline', route: '/(admin)/branding-settings' },
            { label: 'Poster Generator', icon: 'image-outline', route: '/(admin)/poster-generator' },
          ]}
        />

        <MenuSection
          title="Account"
          items={[
            { label: 'Settings / भाषा बदलें', icon: 'settings-outline', route: '/(admin)/settings' },
            { label: 'About Institute', icon: 'school-outline', route: '/(admin)/about' },
          ]}
        />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xxxl }}>
        <Button label="Logout" variant="danger" onPress={logout} fullWidth />
      </View>
    </ScrollView>
  );
}