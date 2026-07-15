import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-user" options={{ headerShown: true, title: 'Create User' }} />
      <Stack.Screen name="create-fee" options={{ headerShown: true, title: 'Add Fee' }} />
      <Stack.Screen name="user-detail" options={{ headerShown: true, title: 'User Details' }} />
      <Stack.Screen name="poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
      <Stack.Screen name="about" options={{ headerShown: true, title: 'About Institute' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="batches" options={{ headerShown: true, title: 'Batches' }} />
      <Stack.Screen name="create-batch" options={{ headerShown: true, title: 'Create Batch' }} />
      <Stack.Screen name="batch-detail" options={{ headerShown: true, title: 'Batch Details' }} />
      <Stack.Screen name="batch-assign" options={{ headerShown: true, title: 'Assign' }} />
    </Stack>
  );
}