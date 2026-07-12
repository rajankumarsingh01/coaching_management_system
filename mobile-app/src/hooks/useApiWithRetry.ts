import { useCallback } from 'react';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useApiWithRetry = () => {
  // Same reasoning — must stay referentially stable across renders.
  const callWithRetry = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS * attempt);
        }
      }
    }
    throw lastError;
  }, []);

  return { callWithRetry };
};