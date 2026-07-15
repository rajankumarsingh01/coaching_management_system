import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// NEW — session ko poori tarah clear karke login screen pe bhejta hai.
// Sirf INSTITUTE_SUSPENDED ke liye use hota hai, generic 403 (permission
// denied) is se trigger NAHI hota — warna student galti se admin route
// hit kare to bhi poore app se logout ho jaata, jo galat hai.
const forceLogoutToLogin = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('user');
  router.replace('/(auth)/login');
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // NEW — institute block ka immediate effect, already-open app ke
    // kisi bhi screen se hone wali API call pe
    if (error.response?.status === 403 && error.response?.data?.errorCode === 'INSTITUTE_SUSPENDED') {
      await forceLogoutToLogin();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        // no refresh token available — genuinely logged out, clear session
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          const newAccessToken = data.data.accessToken;
          await SecureStore.setItemAsync('accessToken', newAccessToken);
          isRefreshing = false;
          onRefreshed(newAccessToken);
        } catch (refreshError) {
          isRefreshing = false;
          // NEW — refresh-token call khud bhi INSTITUTE_SUSPENDED de sakta hai
          // (agar wahi check backend ke refreshAccessToken() me trigger hua)
          if (
            axios.isAxiosError(refreshError) &&
            refreshError.response?.data?.errorCode === 'INSTITUTE_SUSPENDED'
          ) {
            await forceLogoutToLogin();
          } else {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
          }
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;