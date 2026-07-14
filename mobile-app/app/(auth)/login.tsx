import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import { useBranding } from '../../src/context/BrandingContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { branding } = useBranding();
  const { t } = useTranslation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser) return;

      switch (loggedInUser.role) {
        case 'super_admin':
          router.replace('/(superadmin)');
          break;
        case 'admin':
          router.replace('/(admin)');
          break;
        case 'teacher':
          router.replace('/(teacher)');
          break;
        case 'student':
          router.replace('/(student)');
          break;
        case 'parent':
          router.replace('/(parent)');
          break;
        default:
          router.replace('/(auth)/login');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {branding?.logoUrl ? (
        <Image source={{ uri: branding.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : null}

      <Text style={styles.title}>{branding?.displayName || 'Coaching Platform'} {t('auth.loginTitle')}</Text>

      <TextInput
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, branding?.primaryColor ? { backgroundColor: branding.primaryColor } : null]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '...' : t('auth.loginButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});