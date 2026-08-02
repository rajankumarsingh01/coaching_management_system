import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../src/i18n/i18n';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radius, typography } from '../../src/theme/tokens';
import { router } from 'expo-router/build/exports';

export default function TeacherSettingsScreen() {
  const { i18n } = useTranslation();
  const colors = useThemeColors();

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
        Language / भाषा
      </Text>

      <TouchableOpacity
        style={[
          styles.option,
          {
            borderColor: i18n.language === 'en' ? colors.primary : colors.border,
            backgroundColor: i18n.language === 'en' ? colors.primaryMuted : colors.background,
          },
        ]}
        onPress={() => handleLanguageChange('en')}
      >
        <Text style={[typography.body, { color: i18n.language === 'en' ? colors.primary : colors.text }]}>
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          {
            borderColor: i18n.language === 'hi' ? colors.primary : colors.border,
            backgroundColor: i18n.language === 'hi' ? colors.primaryMuted : colors.background,
          },
        ]}
        onPress={() => handleLanguageChange('hi')}
      >
        <Text style={[typography.body, { color: i18n.language === 'hi' ? colors.primary : colors.text }]}>
          हिंदी
        </Text>
      </TouchableOpacity>

      <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.md }]}>
        Account
      </Text>
      <TouchableOpacity
        style={[styles.option, { borderColor: colors.border, backgroundColor: colors.background }]}
        onPress={() => router.push('/(teacher)/change-password')}
      >
        <Text style={[typography.body, { color: colors.text }]}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  option: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
});