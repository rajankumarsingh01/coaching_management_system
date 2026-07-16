import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="attendance" options={{ headerShown: true, title: 'Attendance History' }} />
      <Stack.Screen name="lectures" options={{ headerShown: true, title: 'Lectures' }} />
      <Stack.Screen name="about" options={{ headerShown: true, title: 'About Institute' }} />
      <Stack.Screen name="attempt-test" options={{ headerShown: true, title: 'Attempt Test', gestureEnabled: false }} />
      <Stack.Screen name="weak-topics" options={{ headerShown: true, title: 'Weak Topics' }} />
      <Stack.Screen name="leaderboard" options={{ headerShown: true, title: 'Leaderboard' }} />
      <Stack.Screen name="homework" options={{ headerShown: true, title: 'Homework' }} />
      <Stack.Screen name="submit-homework" options={{ headerShown: true, title: 'Submit Homework' }} />
      <Stack.Screen name="calendar" options={{ headerShown: true, title: 'Calendar' }} />
      <Stack.Screen name="achievements" options={{ headerShown: true, title: 'My Achievements' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="doubt-chat" options={{ headerShown: true, title: 'AI Doubt Solver' }} />
    </Stack>
  );
}