import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import axiosInstance from '../../src/api/axiosInstance';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function ParentChangePasswordScreen() {
  const colors = useThemeColors();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
      // Backend invalidates the refresh token on password change (security
      // best practice) — so we log the user out here and let them sign back
      // in with the new password, instead of leaving a half-valid session.
      Alert.alert('Password changed', 'Please login again with your new password.', [
        { text: 'OK', onPress: () => logout() },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Change Password" />

        <View style={styles.container}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Current password"
              placeholderTextColor={colors.textFaint}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="New password"
              placeholderTextColor={colors.textFaint}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor={colors.textFaint}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Button label="Update password" onPress={handleSubmit} loading={loading} fullWidth style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 15 },
});