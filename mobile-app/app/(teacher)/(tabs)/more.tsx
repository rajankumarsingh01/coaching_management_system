import { ScrollView, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { MenuSection } from '../../../src/components/ui/MenuSection';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing } from '../../../src/theme/tokens';

export default function TeacherMoreScreen() {
  const { user, logout } = useAuth();
  const colors = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="More" tagline={user?.name ? `Signed in as ${user.name}` : 'Settings & tools'} />

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <MenuSection
          title="Academics"
          items={[
            { label: 'My Batches', icon: 'library-outline', route: '/(teacher)/batches' },
            { label: 'Notes & Lectures', icon: 'document-text-outline', route: '/(teacher)/content-batches' },
            { label: 'Tests & Quizzes', icon: 'flask-outline', route: '/(teacher)/test-batches' },
            { label: 'Homework', icon: 'clipboard-outline', route: '/(teacher)/homework-batches' },
            { label: 'Weak Topics', icon: 'analytics-outline', route: '/(teacher)/weak-topics-batches' },
            { label: 'Leaderboard', icon: 'trophy-outline', route: '/(teacher)/leaderboard-batches' },
          ]}
        />

        <MenuSection
          title="Schedule & Pay"
          items={[
            { label: 'Attendance Report', icon: 'bar-chart-outline', route: '/(teacher)/attendance-report' },
            { label: 'Calendar', icon: 'calendar-outline', route: '/(teacher)/calendar-events' },
            { label: 'My Salary', icon: 'wallet-outline', route: '/(teacher)/salary' },
          ]}
        />

        <MenuSection
          title="Marketing"
          items={[{ label: 'Poster Generator', icon: 'image-outline', route: '/(teacher)/poster-generator' }]}
        />

        <MenuSection
          title="Account"
          items={[
            { label: 'Settings / भाषा बदलें', icon: 'settings-outline', route: '/(teacher)/settings' },
            { label: 'About Institute', icon: 'school-outline', route: '/(teacher)/about' },
          ]}
        />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xxxl }}>
        <Button label="Logout" variant="danger" onPress={logout} fullWidth />
      </View>
    </ScrollView>
  );
}