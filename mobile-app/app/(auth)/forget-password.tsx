import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../src/api/axiosInstance';
import { Button } from '../../src/components/ui/Button';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', { email: email.trim() });
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

        <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xl }]}>Forgot password?</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl }]}>
          Enter your email — we'll send you a 6-digit code to reset your password.
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
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textFaint}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <Button label="Send reset code" onPress={handleSend} loading={loading} fullWidth style={{ marginTop: spacing.lg }} />
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
});