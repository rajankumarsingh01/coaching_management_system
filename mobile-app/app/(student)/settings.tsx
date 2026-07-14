import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../src/i18n/i18n';

export default function SettingsScreen() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Language / भाषा</Text>

      <TouchableOpacity
        style={[styles.option, i18n.language === 'en' && styles.optionActive]}
        onPress={() => handleLanguageChange('en')}
      >
        <Text style={[styles.optionText, i18n.language === 'en' && styles.optionTextActive]}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, i18n.language === 'hi' && styles.optionActive]}
        onPress={() => handleLanguageChange('hi')}
      >
        <Text style={[styles.optionText, i18n.language === 'hi' && styles.optionTextActive]}>हिंदी</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  option: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  optionActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  optionText: { fontSize: 15, color: '#374151' },
  optionTextActive: { color: '#1e40af', fontWeight: '600' },
});