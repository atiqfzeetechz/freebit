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

  const { title, body } = remoteMessage.data || {};

  // Get user preference
  const prefString = storage.getString('notification');
  let pref = null;
  if (prefString) {
    pref = JSON.parse(prefString);
  }

  const now = new Date();

  let playSound = true; // default true

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

  let channelId = null;

  if (playSound) {
    // 🔊 Sound + Vibration channel
    channelId = await notifee.createChannel({
      id: 'default_channel11',
      name: 'Default Channel',
      vibration: true,
      vibrationPattern: [300, 500],
      sound: 'server_down_alert', // put file in android/app/src/main/res/raw
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: title || 'Default Title',
      body: body || 'Default Body',
      android: {
        channelId,
        sound: 'server_down_alert',
        vibrationPattern: [300, 500],
        smallIcon: 'ic_notification',
        largeIcon: 'ic_notification',
        pressAction: {
          id: 'default',
        },
      },
    });

  } else {
    // 🤫 Silent channel (No sound, No vibration)
    channelId = await notifee.createChannel({
      id: 'silent_Channel',
      name: 'Silent Notifications',
      sound: undefined,
      vibration: false,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: title || 'Default Title',
      body: body || 'Default Body',
      android: {
        channelId,
        sound: undefined,   // ✅ no sound
        vibration: false,   // ✅ no vibration
        smallIcon: 'ic_notification',
        largeIcon: 'ic_notification',
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
