const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic retry wrapper for any async API call — reused at boot time
// (dashboard data fetch) and can be reused for in-screen data loads too.
export const useApiWithRetry = () => {
  const callWithRetry = async <T,>(fn: () => Promise<T>): Promise<T> => {
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
  };

  return { callWithRetry };
};