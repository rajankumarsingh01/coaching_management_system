import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
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
      <SocketProvider>
        <BrandingProvider>
          <BatchProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/forgot-password" />
              <Stack.Screen name="(auth)/reset-password" />
              <Stack.Screen name="(superadmin)" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(teacher)" />
              <Stack.Screen name="(student)" />
              <Stack.Screen name="(parent)" />
            </Stack>
          </BatchProvider>
        </BrandingProvider>
      </SocketProvider>
    </AuthProvider>
  );
}