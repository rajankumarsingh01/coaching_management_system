import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function ResetPasswordScreen() {
  const colors = useThemeColors();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (otp.trim().length !== 6) {
      setError('Enter the 6-digit code sent to your email');
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
      await axiosInstance.post('/auth/reset-password', {
        email: emailParam,
        otp: otp.trim(),
        newPassword,
      });
      Alert.alert('Success', 'Password reset successfully. Please login with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await axiosInstance.post('/auth/forgot-password', { email: emailParam });
      Alert.alert('Code sent', 'A new reset code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xl }]}>Enter reset code</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl }]}>
          We've sent a 6-digit code to {emailParam}. It expires in 10 minutes.
        </Text>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="keypad-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="6-digit code"
            placeholderTextColor={colors.textFaint}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
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

        <Button label="Reset password" onPress={handleReset} loading={loading} fullWidth style={{ marginTop: spacing.lg }} />

        <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendLink}>
          <Text style={[typography.label, { color: colors.primary }]}>
            {resending ? 'Sending...' : "Didn't get the code? Resend"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.xxl },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
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
  resendLink: { alignItems: 'center', marginTop: spacing.lg },
});