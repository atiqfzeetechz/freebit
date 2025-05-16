// AuthLayout.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyTabs from './TabNavigator';
import { View, Text } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';

const AuthStack = createStackNavigator();

const LoginFo = () => {
  return (
    <View >
      <LoginForm onSubmit={() => {}} />
    </View>
  );
};

const AuthLayout = () => {
  const { isLoggedIn } = useAuth(); // Get auth state from context

  return (
    <>
      {isLoggedIn ? (
        <MyTabs />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginFo} />
        </AuthStack.Navigator>
      )}
    </>
  );
};

export default AuthLayout;