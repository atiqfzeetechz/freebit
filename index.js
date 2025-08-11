/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import AutoStart from 'react-native-autostart';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
 AutoStart.startAutostartSettings();
});
console.log('AutoStart isCustomAndroid:', AutoStart.isCustomAndroid());
// if(AutoStart.isCustomAndroid()) {
//     AutoStart.startAutostartSettings();
// }

 AutoStart.startAutostartSettings();

AppRegistry.registerComponent(appName, () => App);
