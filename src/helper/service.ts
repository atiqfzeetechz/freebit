import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Platform } from 'react-native';

export const startForegroundService = async () => {
  if (Platform.OS !== 'android') return;

  const channelConfig = {
    id: 'webview_service_channel',
    name: 'WebView Service',
    description: 'Keeps WebViewRef alive in background',
    importance: 2, // Low importance to avoid annoying user
    enableVibration: false,
  };

  await VIForegroundService.createNotificationChannel(channelConfig);

  await VIForegroundService.startService({
    channelId: 'webview_service_channel',
    id: 1,
    title: 'App Running',
    text: 'WebView is active in background',
    icon: 'ic_launcher', // drawable resource
  });
};
