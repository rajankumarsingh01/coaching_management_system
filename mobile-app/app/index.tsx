import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AppLoader from '../src/components/AppLoader';
import { useWakeUpPing } from '../src/hooks/useWakeUpPing';
import { useApiWithRetry } from '../src/hooks/useApiWithRetry';
import axiosInstance from '../src/api/axiosInstance';
import { getCachedBranding } from '../src/context/BrandingContext';

type Stage = { progress: number; text: string };

const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/(superadmin)',
  admin: '/(admin)',
  teacher: '/(teacher)',
  student: '/(student)',
  parent: '/(parent)',
};

const MIN_DISPLAY_MS = 700;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BootScreen() {
  const [stage, setStage] = useState<Stage>({ progress: 10, text: 'Starting app...' });
  const [hasError, setHasError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const startedAt = useRef(Date.now());
  const { wakeUp } = useWakeUpPing();
  const { callWithRetry } = useApiWithRetry();

  const finishBoot = useCallback(async (target: string) => {
    const elapsed = Date.now() - startedAt.current;
    if (elapsed < MIN_DISPLAY_MS) await delay(MIN_DISPLAY_MS - elapsed);
    router.replace(target as any);
  }, []);

  const boot = useCallback(async () => {
    setHasError(false);
    startedAt.current = Date.now();

    // Show the institute's own logo in the ring loader if we have it cached
    // from a previous session — pure cosmetic, never blocks boot if missing.
    const cachedBranding = await getCachedBranding();
    if (cachedBranding.logoUrl) setLogoUrl(cachedBranding.logoUrl);

    try {
      setStage({ progress: 20, text: 'Checking session...' });
      const storedToken = await SecureStore.getItemAsync('accessToken');
      const storedUser = await SecureStore.getItemAsync('user');
      const hasSession = !!(storedToken && storedUser);

      setStage({ progress: 40, text: 'Connecting to server...' });
      const awake = await wakeUp();

      if (!hasSession) {
        setStage({ progress: 100, text: 'Ready' });
        await finishBoot('/(auth)/login');
        return;
      }

      if (!awake) {
        setStage({ progress: 40, text: 'Could not reach server' });
        setHasError(true);
        return;
      }

      setStage({ progress: 70, text: 'Loading your dashboard...' });
      const user = JSON.parse(storedUser as string);
      await callWithRetry(() => axiosInstance.get('/users/me'));

      setStage({ progress: 100, text: 'Ready' });
      await finishBoot((ROLE_ROUTES[user.role] as string) || '/(auth)/login');
    } catch (err) {
      const isAuthError =
        axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403);

      if (isAuthError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        setStage({ progress: 100, text: 'Ready' });
        await finishBoot('/(auth)/login');
        return;
      }

      setStage({ progress: 70, text: 'Connection lost' });
      setHasError(true);
    }
  }, [wakeUp, callWithRetry, finishBoot]);

  useEffect(() => {
    boot();
  }, [boot]);

  return (
    <AppLoader
      progress={stage.progress}
      statusText={hasError ? 'Unable to connect. Please try again.' : stage.text}
      hasError={hasError}
      onRetry={hasError ? boot : undefined}
      logoUrl={logoUrl}
    />
  );
}