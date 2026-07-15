import { View, Text } from 'react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

export default function AdminUsersScreen() {
  const colors = useThemeColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Users" />
      <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl }]}>
        Coming soon.
      </Text>
    </View>
  );
}