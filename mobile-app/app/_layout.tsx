import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { BatchProvider } from '../src/context/BatchContext';
import { BrandingProvider } from '../src/context/BrandingContext';
import { initI18n } from '../src/i18n/i18n';
import AppLoader from '../src/components/AppLoader';

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    // Very brief — i18n init is fast (local JSON, no network), just a safety
    // gate so no screen renders with untranslated/undefined text.
    return <AppLoader progress={5} statusText="Starting app..." />;
  }

  return (
    <AuthProvider>
      <BrandingProvider>
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
            <Stack.Screen name="(admin)/poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
            <Stack.Screen name="(teacher)/index" />
            <Stack.Screen name="(teacher)/poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
            <Stack.Screen name="(student)/index" />
            <Stack.Screen name="(parent)/index" />
            <Stack.Screen name="(teacher)/mark-attendance" options={{ headerShown: true, title: 'Mark Attendance' }} />
            <Stack.Screen name="(student)/attendance" options={{ headerShown: true, title: 'Attendance History' }} />
            <Stack.Screen name="(parent)/child-attendance" options={{ headerShown: true, title: "Child's Attendance" }} />
            <Stack.Screen name="(student)/fees" options={{ headerShown: true, title: 'My Fees' }} />
            <Stack.Screen name="(parent)/child-fees" options={{ headerShown: true, title: "Child's Fees" }} />
            <Stack.Screen name="(student)/notes" options={{ headerShown: true, title: 'Notes' }} />
            <Stack.Screen name="(student)/lectures" options={{ headerShown: true, title: 'Lectures' }} />
            <Stack.Screen name="(student)/about" options={{ headerShown: true, title: 'About Institute' }} />
            <Stack.Screen name="(student)/tests" options={{ headerShown: true, title: 'Tests' }} />
            <Stack.Screen name="(student)/attempt-test" options={{ headerShown: true, title: 'Attempt Test', gestureEnabled: false }} />
            <Stack.Screen name="(student)/weak-topics" options={{ headerShown: true, title: 'Weak Topics' }} />
            <Stack.Screen name="(student)/leaderboard" options={{ headerShown: true, title: 'Leaderboard' }} />
            <Stack.Screen name="(student)/homework" options={{ headerShown: true, title: 'Homework' }} />
            <Stack.Screen name="(student)/submit-homework" options={{ headerShown: true, title: 'Submit Homework' }} />
            <Stack.Screen name="(student)/calendar" options={{ headerShown: true, title: 'Calendar' }} />
            <Stack.Screen name="(student)/achievements" options={{ headerShown: true, title: 'My Achievements' }} />
            <Stack.Screen name="(student)/settings" options={{ headerShown: true, title: 'Settings' }} />
          </Stack>
        </BatchProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}