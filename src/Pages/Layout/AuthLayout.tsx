import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MyTabs from './TabNavigator';
import {View} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';
import Withdrawal from '../Withdrawal';
import Sidebar from '../../components/common/Sidebar';
import UserProfile from '../../components/Profile';
import Profile from '../Profile';
import useAxios from '../../hooks/useAxios';
import ChangeWithDrawlAddress from '../ChangeWithDrawlAddress';
import WReports from '../WReports';
import LevelReports from '../LevelReports';

const Stack = createStackNavigator();

const LoginFo = () => (
  <View>
    <LoginForm onSubmit={() => {}} />
  </View>
);

const AuthLayout = () => {
  const {isLoggedIn, setReferalId} = useAuth();
  const {fetchData} = useAxios();

  const getReferalId = async () => {
    try {
      const res = await fetchData({
        url: '/admin/auth/referalIds',
      });
      console.log(res);
      if (res.status == 200) {
        const id = res.data.admin.referalIds;
        console.log(id);
        setReferalId(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getReferalId();
  }, []);

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MyTabs} />
            <Stack.Screen name="Withdrawal" component={Withdrawal} />
            <Stack.Screen name="WithdrawalReports" component={WReports} />
            <Stack.Screen name="levelreports" component={LevelReports} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen
              name="changeWithdrawlAddress"
              component={ChangeWithDrawlAddress}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginFo} />
        )}
      </Stack.Navigator>
      {isLoggedIn && <Sidebar />}{' '}
      {/* ✅ Sidebar rendered globally when logged in */}
    </>
  );
};

export default AuthLayout;
