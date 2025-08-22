// index.js or entry point
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidColor,
} from '@notifee/react-native';
import { storage } from './src/utils/storage';

// ✅ Handle background notification
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background message received:', remoteMessage);

  const { title, body } = remoteMessage.data;

  // 🔔 User preference check (mute/silent logic)
  const prefString = storage.getString('notification');
  let pref = prefString ? JSON.parse(prefString) : null;

  const now = new Date();
  let playSound = true;

  if (pref) {
    if (!pref.enabled) {
      playSound = false;
    } else {
      const start = new Date(pref.startTime);
      const end = new Date(pref.endTime);
      playSound = now >= start && now <= end;
    }
  }

  // 📢 Create proper channel
  let channelId = null;
  if (playSound) {
    channelId = await notifee.createChannel({
      id: 'incoming_call',
      name: 'Incoming Call Alerts',
      vibration: true,
      vibrationPattern: [300, 500, 700, 500],
      sound: 'server_down_alert', // raw folder me ringtone daalo
      importance: AndroidImportance.HIGH,
    });
  } else {
    channelId = await notifee.createChannel({
      id: 'silent_call',
      name: 'Silent Call Alerts',
      sound: undefined,
      importance: AndroidImportance.HIGH,
    });
  }

  console.log('📢 Using Channel:', channelId);

  // 📞 Show Incoming Call UI
 await notifee.displayNotification({
  title: title || '📞 Incoming Call',
  body: body || 'Someone is calling you…',
  android: {
    channelId,
    vibrationPattern: [300, 500],
    sound: playSound ? 'server_down_alert' : undefined,
    smallIcon: 'ic_notification',
    largeIcon: 'ic_notification',

    // ✅ Call category
    category: AndroidCategory.CALL,

    // ✅ Full screen intent
    fullScreenAction: {
      id: 'default',
    },

    // ✅ Persistent + timeout 40s
    ongoing: true,          // Stick on top (like WhatsApp incoming call)
    autoCancel: false,      // User tap se dismiss nahi hoga
    timeoutAfter: 40000,    // 40 sec tak dikhte rahega

    // ✅ Buttons (actions)
    actions: [
      {
        title: '📞 Answer',
        pressAction: { id: 'answer' },
      },
      {
        title: '❌ Decline',
        pressAction: { id: 'decline' },
      },
    ],

    // ✅ Press action (body click)
    pressAction: {
      id: 'default',
    },
  },
});

});

AppRegistry.registerComponent(appName, () => App);
