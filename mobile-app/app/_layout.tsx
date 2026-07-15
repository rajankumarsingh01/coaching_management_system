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
           <Stack.Screen name="(admin)" />
            <Stack.Screen name="(teacher)/index" />
            <Stack.Screen name="(teacher)/poster-generator" options={{ headerShown: true, title: 'Poster Generator' }} />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(parent)/index" />
            <Stack.Screen name="(teacher)/mark-attendance" options={{ headerShown: true, title: 'Mark Attendance' }} />
            <Stack.Screen name="(parent)/child-attendance" options={{ headerShown: true, title: "Child's Attendance" }} />
            <Stack.Screen name="(parent)/child-fees" options={{ headerShown: true, title: "Child's Fees" }} />
          </Stack>
        </BatchProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}