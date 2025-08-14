// index.js or your entry point
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';


messaging().setAutoInitEnabled(false)
// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);

  // Create channel if not already created
  const channelId = await notifee.createChannel({
    id: 'default_channel',
    name: 'Default Channel',
    vibration: true,
    vibrationPattern: [300, 500],
    sound: 'server_down_alert', // put the file in android/app/src/main/res/raw
  });

  // Show notification
  await notifee.displayNotification({
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
});

AppRegistry.registerComponent(appName, () => App);
