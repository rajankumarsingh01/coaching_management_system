import { View, ScrollView, Text } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

export default function SuperAdminMoreScreen() {
  const { user, logout } = useAuth();
  const colors = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="More" tagline={user?.name ? `Signed in as ${user.name}` : 'Platform administration'} />

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <Card>
          <Text style={[typography.label, { color: colors.textMuted }]}>ROLE</Text>
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xs }]}>
            Platform Super Admin
          </Text>
          <Text style={[typography.caption, { color: colors.textFaint, marginTop: spacing.xs }]}>
            Full access across all institutes on the platform.
          </Text>
        </Card>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.xxxl }}>
        <Button label="Logout" variant="danger" onPress={logout} fullWidth />
      </View>
    </ScrollView>
  );
}