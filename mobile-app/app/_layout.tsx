import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(superadmin)/index" />
        <Stack.Screen name="(superadmin)/create-institute" options={{ headerShown: true, title: 'Onboard Institute' }} />
        <Stack.Screen name="(admin)/index" />
        <Stack.Screen name="(teacher)/index" />
        <Stack.Screen name="(student)/index" />
        <Stack.Screen name="(parent)/index" />
      </Stack>
    </AuthProvider>
  );
}