import React, { useEffect } from 'react';
import { DeviceEventEmitter, ToastAndroid, StyleSheet, Button, View } from 'react-native';
import {
  showFloatingBubble,
  hideFloatingBubble,
  requestPermission,
  initialize,
} from 'react-native-floating-bubble';

const showToast = (text: string) => ToastAndroid.show(text, ToastAndroid.SHORT);


// Main Component
export default function FloatingBubbleExample() {
  useEffect(() => {
    // Initialize bubble and request permission
    const initBubble = async () => {
      try {
        await requestPermission();
        await initialize();
        console.log('Bubble initialized');
      } catch (error) {
        console.log('Permission denied or initialization failed', error);
      }
    };

    initBubble();

    // Event listeners for bubble interactions
    const pressListener = DeviceEventEmitter.addListener(
      'floating-bubble-press',
      () => showToast('Bubble Pressed!')
    );

    const removeListener = DeviceEventEmitter.addListener(
      'floating-bubble-remove',
      () => showToast('Bubble Removed!')
    );

    // Cleanup
    return () => {
      pressListener.remove();
      removeListener.remove();
      hideFloatingBubble(); // Hide bubble when component unmounts
    };
  }, []);

  const handleShowBubble = async () => {
    try {
      await showFloatingBubble(50, 50); // Position at x=50, y=50
      showToast('Bubble Shown!');
    } catch (error) {
      showToast('Failed to show bubble');
    }
  };

  const handleHideBubble = async () => {
    try {
      await hideFloatingBubble();
      showToast('Bubble Hidden!');
    } catch (error) {
      showToast('Failed to hide bubble');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Show Bubble" onPress={handleShowBubble} />
      <Button title="Hide Bubble" onPress={handleHideBubble} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});