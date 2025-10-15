import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    // iOS 16+ behavior fields
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function initNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('new-posts', {
      name: 'New Posts',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#FF6B6B',
      sound: undefined,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
}

export async function notifyNewPost() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New posts available',
      body: 'Tap to refresh your feed',
      sound: undefined,
    },
    trigger: null,
  });
}
