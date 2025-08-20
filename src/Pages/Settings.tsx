import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Alert } from 'react-native';
import { Appbar, Card, Button } from 'react-native-paper';
import MenuSvg from '../../assets/svg/menu.svg';
import { useSidebar } from '../context/SidebarContext';
import { wp } from '../helper/hpwp';
import DateTimePicker from '@react-native-community/datetimepicker';
import useAxios from '../hooks/useAxios';
import useApiCall from '../hooks/useApiCall';

export default function Settings() {
  const { openSidebar } = useSidebar();
  const { fetchData, error, setError, loading } = useAxios();
  const {saveNotificationToMMKV} = useApiCall()

  const now = new Date();
  const startTimeInit = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    0,
  );
  const endTimeInit = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    21,
    0,
  );

  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [startTime, setStartTime] = useState(startTimeInit);
  const [endTime, setEndTime] = useState(endTimeInit);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [savedSettings, setSavedSettings] = useState(null);

  // Get saved preferences on mount
     const loadPreferences = async () => {
      try {
        const res= await saveNotificationToMMKV()
        
        if (res?.data?.success) {
          const response = res.data;
          setIsNotificationEnabled(response.data.isNotificationEnabled || false);
          
          if (response.data.startTime) {
            setStartTime(new Date(response.data.startTime));
          }
          if (response.data.endTime) {
            setEndTime(new Date(response.data.endTime));
          }
          
          setSavedSettings(response.data);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
  useEffect(() => {
 

    loadPreferences();
  }, []);

  const saveYourPreference = async () => {
    const payload = {
      enabled: isNotificationEnabled,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    
    try {
      const res = await fetchData({
        url: '/user/notification/create',
        method: 'POST',
        data: payload,
      });

      if (res?.data?.success) {
        loadPreferences()
        Alert.alert(
          'Success', 
          'Your notification preferences have been saved successfully!',
          [{ text: 'OK' }]
        );
        setSavedSettings({
          isNotificationEnabled,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        });
      } else {
        Alert.alert(
          'Error', 
          'Failed to save your preferences. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Error', 
        'An error occurred while saving your preferences.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartPicker(false);
    if (selectedTime) setStartTime(selectedTime);
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndPicker(false);
    if (selectedTime) setEndTime(selectedTime);
  };

  const getNotificationStatusMessage = () => {
    if (!isNotificationEnabled) {
      return "Notifications are currently disabled. You won't receive any alerts.";
    }
    
    return `You will receive notifications between ${formatTime(startTime)} and ${formatTime(endTime)}.`;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Action
          icon={() => <MenuSvg width={25} height={25} />}
          onPress={openSidebar}
        />
        <Appbar.Content title=" Settings"  titleStyle={{
            fontSize: 18,
            fontWeight: '800',
          }}/>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.notificationHeader}>
              <View>
                <Text style={styles.cardTitle}>Notification Period</Text>
                <Text style={styles.statusText}>
                  {getNotificationStatusMessage()}
                </Text>
              </View>
              <Switch
                value={isNotificationEnabled}
                onValueChange={setIsNotificationEnabled}
                color="#6200ee"
              />
            </View>

            {isNotificationEnabled && (
              <>
                <Text style={styles.sectionDescription}>
                  Choose the time range when you want to receive notifications
                </Text>

                <View style={styles.timeContainer}>
                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowStartPicker(true)}
                      style={styles.timeButton}
                      labelStyle={styles.timeButtonText}
                      icon="clock-outline"
                    >
                      {formatTime(startTime)}
                    </Button>
                    {showStartPicker && (
                      <DateTimePicker
                        value={startTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onStartTimeChange}
                      />
                    )}
                  </View>

                  <Text style={styles.timeSeparatorText}>to</Text>

                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowEndPicker(true)}
                      style={styles.timeButton}
                      labelStyle={styles.timeButtonText}
                      icon="clock-outline"
                    >
                      {formatTime(endTime)}
                    </Button>
                    {showEndPicker && (
                      <DateTimePicker
                        value={endTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onEndTimeChange}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>
                    💡 You will only receive notifications during this time period. 
                    Outside these hours, notifications will be silent.
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={saveYourPreference}
          loading={loading}
          disabled={loading}
          icon="content-save"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>

        {savedSettings && (
          <Card style={styles.savedSettingsCard}>
            <Card.Content>
              <Text style={styles.savedTitle}>Current Settings</Text>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Status:</Text>
                <Text style={[
                  styles.settingsValue, 
                  savedSettings.isNotificationEnabled ? styles.enabledText : styles.disabledText
                ]}>
                  {savedSettings.isNotificationEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              {savedSettings.isNotificationEnabled && (
                <>
                  <View style={styles.settingsRow}>
                    <Text style={styles.settingsLabel}>Start Time:</Text>
                    <Text style={styles.settingsValue}>
                      {formatTime(new Date(savedSettings.startTime))}
                    </Text>
                  </View>
                  <View style={styles.settingsRow}>
                    <Text style={styles.settingsLabel}>End Time:</Text>
                    <Text style={styles.settingsValue}>
                      {formatTime(new Date(savedSettings.endTime))}
                    </Text>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { width: wp(100), elevation: 4 },
  scrollView: { flex: 1, padding: 16 },
  card: { marginBottom: 16, borderRadius: 12, elevation: 2 },
  savedSettingsCard: { marginBottom: 16, borderRadius: 12, elevation: 2, backgroundColor: '#e8f5e9' },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  savedTitle: { fontSize: 16, fontWeight: '600', color: '#2e7d32', marginBottom: 12 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 8, maxWidth: '70%' },
  sectionDescription: { fontSize: 14, color: '#666', marginBottom: 16, fontStyle: 'italic' },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  timeSection: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
  timeButton: { borderColor: '#6200ee', borderWidth: 1, borderRadius: 8, width: '100%' },
  timeButtonText: { color: '#6200ee', fontSize: 16 },
  timeSeparatorText: { fontSize: 16, fontWeight: 'bold', color: '#666', marginHorizontal: 8 },
  noteContainer: { 
    backgroundColor: '#f3e5f5', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0'
  },
  noteText: { fontSize: 13, color: '#6a1b9a', fontStyle: 'italic' },
  saveButton: { 
    marginTop: 16, 
    marginBottom: 24, 
    borderRadius: 8, 
    paddingVertical: 6,
    backgroundColor: '#6200ee'
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  settingsLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  enabledText: {
    color: '#2e7d32',
  },
  disabledText: {
    color: '#d32f2f',
  },
});