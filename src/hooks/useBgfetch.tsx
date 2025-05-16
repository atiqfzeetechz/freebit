// useBgFetch.ts
import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import Event from '../utils/Event';
import {scheduleNotification} from '../Pages/Home';

const useBgFetch = () => {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState(-1);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    initBackgroundFetch();
    loadEvents();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://backend.jimsbelpkl.in?test=bgfetch',
      );
      if (!response.ok) throw new Error('Network response was not ok');

      console.log('Fetched data:');
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const initBackgroundFetch = async () => {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
        forceAlarmManager: false,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: false,
        requiresStorageNotLow: false,
      },
      async (taskId: string) => {
        const now = new Date().toLocaleString();
        console.log(`[BackgroundFetch] Task ${taskId} executed at ${now}`);

        let message = '';
        let status = 'executed';

        try {
          await fetchData(); // You can enhance fetchData to return result or throw error
          message = 'Data fetched successfully';
        } catch (error) {
          status = 'failed';
          message = String(error);
        }

        scheduleNotification('Task performed now');
        const event = await Event.create(taskId, false, status, message);
        setEvents(prev => [...prev, event]);

        BackgroundFetch.finish(taskId);
      },
    );
    setStatus(status);
    setEnabled(true);
  };

  const loadEvents = () => {
    Event.all()
      .then(setEvents)
      .catch(error =>
        Alert.alert('Error', 'Failed to load data from AsyncStorage: ' + error),
      );
  };

  const toggleEnabled = async (value: boolean) => {
    setEnabled(value);
    value ? BackgroundFetch.start() : BackgroundFetch.stop();
  };

  const checkStatus = async (): Promise<string> => {
    const status = await BackgroundFetch.status();
    switch (status) {
      case BackgroundFetch.STATUS_AVAILABLE:
        return 'STATUS_AVAILABLE';
      case BackgroundFetch.STATUS_DENIED:
        return 'STATUS_DENIED';
      case BackgroundFetch.STATUS_RESTRICTED:
        return 'STATUS_RESTRICTED';
      default:
        return 'UNKNOWN';
    }
  };

  const scheduleTask = async () => {
    fetchData();
    try {
      await BackgroundFetch.scheduleTask({
        taskId: 'com.transistorsoft.customtask',
        delay: 6000,
        forceAlarmManager: true,
      });
      console.log('task scgeduled for 5000ms');
      loadEvents();
    } catch (error) {
      Alert.alert('scheduleTask ERROR', String(error));
    }
  };

  const clearEvents = () => {
    Event.destroyAll();
    setEvents([]);
  };

  return {
    enabled,
    status,
    events,
    toggleEnabled,
    checkStatus,
    scheduleTask,
    clearEvents,
  };
};

export default useBgFetch;
