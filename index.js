/**
 * @format
 */

import { AppRegistry, NativeModules, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import AutoStart from 'react-native-autostart';
import { getMyRewardPoints, getWebViewRef } from './src/utils/globalWebViewRef';

// getWebViewRef 
 
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('bg message received:', remoteMessage);
  const ref = getWebViewRef()?.current?.current;
  console.log( getWebViewRef())
  console.log( getWebViewRef().current)
  if (ref) {
    getMyRewardPoints();
    ref.injectJavaScript(`alert("Notification Received in Background");`);
  } else {
    console.log('WebViewRef not available in background');
  }
  // if (Platform.OS === 'android') {
  //   NativeModules.IntentLauncher.sendBroadcast("com.freebit.OPEN_APP");
  // }
});

console.log('AutoStart isCustomAndroid:', AutoStart.isCustomAndroid());
// if(AutoStart.isCustomAndroid()) {
//     AutoStart.startAutostartSettings();
// }

AutoStart.startAutostartSettings();

AppRegistry.registerComponent(appName, () => App);
