import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '../../../src/api/axiosInstance';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, radius, typography } from '../../../src/theme/tokens';

export default function OnboardInstituteScreen() {
  const colors = useThemeColors();
  const [form, setForm] = useState({
    instituteName: '',
    instituteCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/institutes', form);
      Alert.alert('Success', `Institute "${data.data.institute.name}" created`, [
        {
          text: 'OK',
          onPress: () => {
            setForm({ instituteName: '', instituteCode: '', adminName: '', adminEmail: '', adminPassword: '' });
            router.push('/(superadmin)/(tabs)');
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Onboard Institute" tagline="Create a new institute & admin account" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
            INSTITUTE DETAILS
          </Text>
          <TextInput
            placeholder="Institute Name"
            placeholderTextColor={colors.textFaint}
            value={form.instituteName}
            onChangeText={(v) => handleChange('instituteName', v)}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <TextInput
            placeholder="Institute Code (e.g. SCC001)"
            placeholderTextColor={colors.textFaint}
            value={form.instituteCode}
            onChangeText={(v) => handleChange('instituteCode', v)}
            autoCapitalize="characters"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />

          <Text style={[typography.label, { color: colors.textMuted }, styles.sectionLabel]}>
            ADMIN ACCOUNT
          </Text>
          <TextInput
            placeholder="Admin Name"
            placeholderTextColor={colors.textFaint}
            value={form.adminName}
            onChangeText={(v) => handleChange('adminName', v)}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <TextInput
            placeholder="Admin Email"
            placeholderTextColor={colors.textFaint}
            value={form.adminEmail}
            onChangeText={(v) => handleChange('adminEmail', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <TextInput
            placeholder="Admin Password"
            placeholderTextColor={colors.textFaint}
            value={form.adminPassword}
            onChangeText={(v) => handleChange('adminPassword', v)}
            secureTextEntry
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />

          <Button
            label={loading ? 'Creating...' : 'Create Institute'}
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 15,
  },
});