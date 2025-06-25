import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MyTabs from './TabNavigator';
import {View} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';
import Withdrawal from '../Withdrawal';
import Sidebar from '../../components/common/Sidebar';
import UserProfile from '../../components/Profile';
import Profile from '../Profile';


const Stack = createStackNavigator();

const LoginFo = () => (
  <View>
    <LoginForm onSubmit={() => {}} />
  </View>
);

const AuthLayout = () => {
  const {isLoggedIn} = useAuth();

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MyTabs} />
            <Stack.Screen name="Withdrawal" component={Withdrawal} />
            <Stack.Screen name="Profile" component={Profile} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginFo} />
        )}
      </Stack.Navigator>

      {isLoggedIn && <Sidebar />} {/* ✅ Sidebar rendered globally when logged in */}
    </>
  );
};

export default AuthLayout;
