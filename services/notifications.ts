import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule> | null = null;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (isExpoGo) {
    return null;
  }
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }
  return notificationsModulePromise;
}

export async function initNotifications() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

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
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New posts available',
      body: 'Tap to refresh your feed',
      sound: undefined,
    },
    trigger: null,
  });
}
