import { useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useWakeUpPing = () => {
  // Memoized so its reference stays stable across renders — otherwise any
  // effect/useCallback depending on `wakeUp` re-fires on every render.
  const wakeUp = useCallback(async (): Promise<boolean> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        await axiosInstance.get('/health', { timeout: 20000 });
        return true;
      } catch (err) {
        if (attempt === MAX_RETRIES) return false;
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
    return false;
  }, []);

  return { wakeUp };
};