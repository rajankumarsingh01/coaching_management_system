import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../src/i18n/i18n';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radius, typography } from '../../src/theme/tokens';
import { router } from 'expo-router/build/exports';

export default function SettingsScreen() {
  const { i18n } = useTranslation();
  const colors = useThemeColors();

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Settings" tagline="Language / भाषा" />
      <View style={styles.container}>
        <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
          LANGUAGE / भाषा
        </Text>

        <TouchableOpacity
          style={[
            styles.option,
            { borderColor: colors.border },
            i18n.language === 'en' && { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text
            style={[
              typography.body,
              { color: i18n.language === 'en' ? colors.primary : colors.text },
              i18n.language === 'en' && { fontWeight: '600' },
            ]}
          >
            English
          </Text>

          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel, { marginTop: spacing.xl }]}>
          ACCOUNT
        </Text>
        <TouchableOpacity
          style={[styles.option, { borderColor: colors.border }]}
          onPress={() => router.push('/(student)/change-password')}
        >
          <Text style={[typography.body, { color: colors.text }]}>Change Password</Text>
        </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            { borderColor: colors.border },
            i18n.language === 'hi' && { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
          ]}
          onPress={() => handleLanguageChange('hi')}
        >
          <Text
            style={[
              typography.body,
              { color: i18n.language === 'hi' ? colors.primary : colors.text },
              i18n.language === 'hi' && { fontWeight: '600' },
            ]}
          >
            हिंदी
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  sectionLabel: { marginBottom: spacing.md },
  option: { borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm },
});