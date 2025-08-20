// index.js or your entry point
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { storage } from './src/utils/storage';

// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);

  const { title, body } = remoteMessage.data;  // ✅ FCM se bheja hua data use kar rahe

  // Create channels
  const prefString = storage.getString('notification');
  let pref = null;
  if (prefString) {
    pref = JSON.parse(prefString);
  }

  const now = new Date();

  let playSound = true; // default: play sound if nothing found

  if (pref) {
    if (!pref.enabled) {
      playSound = false;
    } else {
      const start = new Date(pref.startTime);
      const end = new Date(pref.endTime);

      if (now >= start && now <= end) {
        playSound = true;
      } else {
        playSound = false;
      }
    }
  }

  let channelId = null
  if (playSound) {
    channelId = await notifee.createChannel({
      id: 'default_channel11',
      name: 'Default Channel',
      vibration: true,
      vibrationPattern: [300, 500],
      sound: 'server_down_alert', // file: android/app/src/main/res/raw
      importance: AndroidImportance.HIGH,
    });
  } else {
    channelId = await notifee.createChannel({
      id: 'silent',
      name: 'Silent Notifications',
      sound: undefined, // ✅ koi sound nahi (silent)
      importance: AndroidImportance.HIGH,
    });
  }



console.log(channelId)
  // Show notification
  await notifee.displayNotification({
    title: title || 'Default Title',  // ✅ agar empty ho to fallback
    body: body || 'Default Body',
    android: {
      channelId,
      vibrationPattern: [300, 500],
      sound: 'server_down_alert',
      smallIcon: 'ic_notification',
      largeIcon: 'ic_notification',
      pressAction: {
        id: 'default',
      },
    },
  });
});


AppRegistry.registerComponent(appName, () => App);
