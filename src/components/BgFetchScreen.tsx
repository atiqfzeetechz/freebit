import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Switch,
  Button,
  Alert,
} from 'react-native';
import useBgFetch from '../hooks/useBgfetch';

const Colors = {
  gold: '#fedd1e',
  black: '#000',
  white: '#fff',
  lightGrey: '#ccc',
  blue: '#337AB7',
};

const BgFetchScreen = () => {
  const {
    enabled,
    status,
    events,
    toggleEnabled,
    checkStatus,
    scheduleTask,
    clearEvents,
  } = useBgFetch();

  const onCheckStatus = async () => {
    const statusText = await checkStatus();
    Alert.alert('BackgroundFetch.status()', `${statusText} (${status})`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'executed':
        return {color: 'green'};
      case 'failed':
        return {color: 'red'};
      case 'scheduled':
        return {color: 'orange'};
      default:
        return {color: Colors.black};
    }
  };

  const renderEvents = () => {
    if (!events.length) {
      return (
        <Text style={{padding: 10, fontSize: 16}}>
          Waiting for BackgroundFetch events...
        </Text>
      );
    }

    return events
      .slice()
      .reverse()
      .map(event => (
        <View key={event.key} style={styles.event}>
          <Text style={styles.taskId}>
            {event.taskId} {event.isHeadless ? '[Headless]' : ''}
          </Text>
          <Text style={styles.timestamp}>{event.timestamp}</Text>
          <Text style={[styles.status, getStatusStyle(event.status)]}>
            Status: {event.status}
          </Text>
          {event.message ? (
            <Text style={styles.message}>Message: {event.message}</Text>
          ) : null}
        </View>
      ));
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.gold}}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.title}>BGFetch Demo</Text>
          <Switch value={enabled} onValueChange={toggleEnabled} />
        </View>
        <ScrollView style={styles.eventList}>{renderEvents()}</ScrollView>
        <View style={styles.toolbar}>
          <Button title={`status: ${status}`} onPress={onCheckStatus} />
          <Button title="scheduleTask" onPress={scheduleTask} />
          <View style={{flex: 1}} />
          <Button title="clear" onPress={clearEvents} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 24,
    flex: 1,
    fontWeight: 'bold',
    color: Colors.black,
  },
  eventList: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  event: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: Colors.lightGrey,
  },
  taskId: {
    color: Colors.blue,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    color: Colors.black,
  },
  status: {
    fontWeight: '600',
    marginTop: 4,
  },
  message: {
    fontStyle: 'italic',
    color: Colors.black,
    marginTop: 2,
  },
  toolbar: {
    height: 57,
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: Colors.gold,
  },
});

export default BgFetchScreen;
