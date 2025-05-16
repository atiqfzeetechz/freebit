import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLoader } from '../hooks/useLoader';


const GlobalLoader: React.FC = () => {
  const { loading } = useLoader();

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#321dec" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default GlobalLoader;
