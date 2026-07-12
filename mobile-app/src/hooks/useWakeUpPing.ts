import axiosInstance from '../api/axiosInstance';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Pings the backend /health route to wake a sleeping free-tier Render instance,
// with simple retry+backoff since the first cold-start request can take 30-50s.
export const useWakeUpPing = () => {
  const wakeUp = async (): Promise<boolean> => {
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
  };

  return { wakeUp };
};