import { useEffect, useCallback } from 'react';
import useAxios from './useAxios';
import { useMMKVObject } from 'react-native-mmkv';

export default function useApiCall() {
  const { fetchData } = useAxios();
  const [notificationPref, setNotificationPref] = useMMKVObject('notification');

  // API se notification pref laao aur MMKV me save karo
  const saveNotificationToMMKV = useCallback(async () => {
    try {
      const res = await fetchData({
        url: '/user/notification',
        method: 'GET',
      });

      if (res?.data?.success) {
        const response = res.data;

        // ✅ MMKV me save karo
        setNotificationPref({
          enabled: response.data.isNotificationEnabled || false,
          startTime: response.data.startTime || null,
          endTime: response.data.endTime || null,
        });

        console.log('✅ Saved to MMKV:', {
          enabled: response.data.isNotificationEnabled || false,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
        });
      }
      console.log(notificationPref)
      return res;
    } catch (err) {
      console.error('❌ Failed to load preferences:', err);
      return err;
    }
  }, [fetchData, setNotificationPref]);

  // Hook return karega
  return {
    notificationPref,
    saveNotificationToMMKV,
  };
}
