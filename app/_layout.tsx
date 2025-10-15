import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initNotifications } from '../services/notifications';
import { useAuthStore } from '../store/authStore';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadAuth, isLoading } = useAuthStore();

  useEffect(() => {
    loadAuth()
      .then(() => initNotifications())
      .finally(() => {
        SplashScreen.hideAsync();
      });
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
