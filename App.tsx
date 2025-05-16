import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MyTabs from './src/Pages/Layout/TabNavigator';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext';
import {PaperProvider} from 'react-native-paper';

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <MyTabs />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
