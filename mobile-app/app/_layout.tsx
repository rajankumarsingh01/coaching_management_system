import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { BatchProvider } from '../src/context/BatchContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <BatchProvider>
       <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="(auth)/login" />
  <Stack.Screen name="(superadmin)/index" />
  <Stack.Screen
    name="(superadmin)/create-institute"
    options={{ headerShown: true, title: 'Onboard Institute' }}
  />
  <Stack.Screen name="(admin)/index" />
  <Stack.Screen name="(admin)/create-user" options={{ headerShown: true, title: 'Create User' }} />
  <Stack.Screen name="(teacher)/index" />
  <Stack.Screen name="(student)/index" />
  <Stack.Screen name="(parent)/index" />
</Stack>
      </BatchProvider>
    </AuthProvider>
  );
}