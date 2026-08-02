import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { Button } from '../../src/components/ui/Button';
import { spacing, typography, radius } from '../../src/theme/tokens';
import { PLATFORM } from '../../src/constants/platform';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      if (!loggedInUser) return;

      const roleRoutes: Record<string, string> = {
        super_admin: '/(superadmin)',
        admin: '/(admin)',
        teacher: '/(teacher)',
        student: '/(student)',
        parent: '/(parent)',
      };
      router.replace((roleRoutes[loggedInUser.role] ?? '/(auth)/login') as any);
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
        {/* PLATFORM identity here — never a specific institute's branding.
            We don't know which institute this user belongs to until AFTER
            they log in, so this panel is fixed/global, not theme-driven. */}
        <LinearGradient
          colors={['#4338CA', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandPanel}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.brandName}>{PLATFORM.name}</Text>
            <Text style={styles.brandTagline}>{PLATFORM.tagline}</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={[styles.formSheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[typography.h1, { color: colors.text }]}>{t('auth.loginTitle')}</Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl }]}>
            Sign in to continue
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
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={colors.textFaint}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.textFaint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, { color: colors.text }]}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'flex-end', marginBottom: spacing.sm }}
          >
            <Text style={[typography.label, { color: colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label={t('auth.loginButton')}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  brandPanel: {
    height: 260,
    borderBottomLeftRadius: radius.xl * 1.5,
    borderBottomRightRadius: radius.xl * 1.5,
    justifyContent: 'flex-end',
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  brandName: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  formSheet: {
    flex: 1,
    marginTop: -spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
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