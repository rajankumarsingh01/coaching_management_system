import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-user" options={{ headerShown: true, title: 'Create User' }} />
      <Stack.Screen name="create-fee" options={{ headerShown: true, title: 'Add Fee' }} />
      <Stack.Screen name="poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
    </Stack>
  );
}