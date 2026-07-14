import { useEffect, useRef, useCallback } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axiosInstance from '../api/axiosInstance';

// Push notifications require a native "development build" (EAS Build) —
// Expo Go (SDK 53+) no longer supports Android remote push notifications
// at all. We detect Expo Go and skip registration entirely rather than
// crashing, so the rest of the app keeps working during development.
// This will automatically start working once the app is run via an EAS
// development/production build instead of Expo Go — no code change needed then.
const isRunningInExpoGo = Constants.appOwnership === 'expo';

export const usePushNotifications = (enabled: boolean) => {
  const registered = useRef(false);

  const registerForPushNotifications = useCallback(async () => {
    if (isRunningInExpoGo) {
      // Silently skip — expected during Expo Go development.
      return;
    }

    try {
      // Dynamic import so expo-notifications' Expo-Go warning/crash code
      // path is never even touched when running inside Expo Go.
      const Notifications = await import('expo-notifications');
      const Device = await import('expo-device');

      if (!Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      const expoPushToken = tokenResponse.data;

      await axiosInstance.post('/notifications/register-token', { expoPushToken });
    } catch (err) {
      console.error('Failed to register push token', err);
    }
  }, []);

  useEffect(() => {
    if (enabled && !registered.current) {
      registered.current = true;
      registerForPushNotifications();
    }
  }, [enabled, registerForPushNotifications]);
};