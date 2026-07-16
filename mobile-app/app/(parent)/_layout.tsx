import { Stack } from 'expo-router';
import { ChildProvider } from '../../src/context/ChildContext';

export default function ParentLayout() {
  return (
    <ChildProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="results" options={{ headerShown: true, title: 'Results' }} />
      </Stack>
    </ChildProvider>
  );
}