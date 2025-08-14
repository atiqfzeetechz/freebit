import Toast from 'react-native-toast-message';

import notifee, {
  AndroidImportance,
  AndroidDefaults,
} from '@notifee/react-native';

const showNotification = (
  message: string,
  type: 'error' | 'success' | 'info',
) => {
  console.log(message, type);
  return Toast.show({
    type: type,
    text1: message,
  });
};

async function onDisplayNotification() {
  console.log('called');
  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default 11',
    name: 'Default Channel',
    vibration: true,
    vibrationPattern: [300, 500],
    sound: 'server_down_alert',
  });

  console.log(channelId);
  // Display a notification
  try {
    const sttus = await notifee.displayNotification({
      title: 'FreeBTC roll Alert ⚠',
      body: 'Click to Roll',

      android: {
        channelId,

        vibrationPattern: [300, 500],
        sound: 'server_down_alert',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export { showNotification, onDisplayNotification };

