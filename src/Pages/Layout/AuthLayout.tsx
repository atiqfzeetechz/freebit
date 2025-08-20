import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyTabs from './TabNavigator';
import {
  PermissionsAndroid,
  Platform,
  View,
  InteractionManager,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';
import Withdrawal from '../Withdrawal';
import Sidebar from '../../components/common/Sidebar';
import UserProfile from '../../components/Profile';
import Profile from '../Profile';
import useAxios from '../../hooks/useAxios';
import ChangeWithDrawlAddress from '../ChangeWithDrawlAddress';
import WReports from '../WReports';
import LevelReports from '../LevelReports';
import InvalidUserRegForm from '../../components/InavlidUserRegFrom';
import { useNavigationState, useRoute } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import WebviewLayout from './WebviewLayout';

import notifee, { AndroidImportance } from '@notifee/react-native';
import { onDisplayNotification } from '../../utils/Notify';
import useDeviceInfo from '../../hooks/useDeviceInfo';
import TeamRolls from '../TeamRolls';
import Settings from '../Settings';

const Stack = createStackNavigator();

const LoginFo = () => {
  const route = useRoute();
  const email = route?.params?.email;
  const password = route?.params?.password;

  return (
    <View>
      <LoginForm
        onSubmit={() => {}}
        propsEmail={email}
        propsPassword={password}
        actTab={email && password ? 'signup' : 'login'}
      />
    </View>
  );
};




const AuthLayout = () => {
  const { isLoggedIn, setReferalId, FcmToken, setFcmToken } = useAuth();
  const { fetchData } = useAxios();


  // ✅ Safe notification permission request using InteractionManager
  const requestPermission = async (): Promise<void> => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getFcmToken();
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      requestPermission();
    });
    return () => task.cancel();
  }, []);

  const getReferalId = async () => {
    try {
      const res = await fetchData({
        url: '/admin/auth/referalIds',
      });
      if (res.status === 200) {
        const id = res.data.admin.referalIds;
        setReferalId(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getReferalId();
  }, []);

  useEffect(() => {

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);

// onDisplayNotification()

      // setFcmToken();
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log(token);
    } catch (error) {
      console.log(error);
    }
  };
  const [webViewVisible, setWebViewVisible] = useState(false);
  useEffect(() => {
    if (isLoggedIn) {
      setWebViewVisible(true); // initially absolute hidden
      const timer = setTimeout(() => {
        setWebViewVisible(false); // switch to normal view
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);


 
  return (
    <>
      {/* {isLoggedIn && <WebviewLayout visible={false} />} */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MyTabs} />
            <Stack.Screen name="Withdrawal" component={Withdrawal} />
            <Stack.Screen name="WithdrawalReports" component={WReports} />
            <Stack.Screen name="levelreports" component={LevelReports} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="levelRolls" component={TeamRolls} />
            <Stack.Screen name="setting" component={Settings} />
            <Stack.Screen
              name="changeWithdrawlAddress"
              component={ChangeWithDrawlAddress}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginFo} />
            <Stack.Screen
              name="InvalidUserRegForm"
              component={InvalidUserRegForm}
            />
          </>
        )}
      </Stack.Navigator>

      {isLoggedIn && <Sidebar />}
    </>
  );
};

export default AuthLayout;
