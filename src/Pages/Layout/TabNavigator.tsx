import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import Home from '../Home';
import Profile from '../Profile';
import RollHistory from '../RollHistory';
import WebSync from '../WebSync';
import Refer from './Refer';
import Withdrawal from '../Withdrawal';
import Menu from '../Menu';

import SyncSvg from '../../../assets/svg/sync.svg';
import HomeSvg from '../../../assets/svg/home.svg';
import HistorySvg from '../../../assets/svg/history.svg';
import UsersSvg from '../../../assets/svg/users.svg';
import MenuSvg from '../../../assets/svg/menu-grid.svg';
import WebviewLayout from './WebviewLayout';
import { useAuth } from '../../hooks/useAuth';
import { useNavigationState, useRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabIcon = memo(({ Icon }) => <Icon height={22} width={22} color={'red'} />); // smaller icon

function MyTabs() {
  const {isLoggedIn}=useAuth()
const currentRoute = useNavigationState(state => {
    const mainTabState = state.routes.find(r => r.name === 'Main');
    if (!mainTabState || !mainTabState.state) return null; // no nested state yet
    const tabIndex = mainTabState.state.index;
    return mainTabState.state.routes[tabIndex]?.name;
  });
  console.log(currentRoute)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          lazy: true,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 75, // give enough space for label
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -2, // bring label closer to icon
          },
          tabBarIconStyle: {
            marginTop: 5, // push icon down a bit so label fits
          },
        }}
        // initialRouteName='Sync'
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: () => <TabIcon Icon={HomeSvg} />,
          }}
        />
        <Tab.Screen
          name="RollHistory"
          component={RollHistory}
          options={{
            title: 'Roll History',
            tabBarIcon: () => <TabIcon Icon={HistorySvg} />,
          }}
        />
        <Tab.Screen
          name="Sync"
          component={WebSync}
          options={{
            tabBarIcon: () => <TabIcon Icon={SyncSvg} />,
          }}
        />
        <Tab.Screen
          name="Refer"
          component={Refer}
          options={{
            title: 'Refer & Earn',
            tabBarLabel: 'Refer & Earn',
            tabBarIcon: () => <TabIcon Icon={UsersSvg} />,
          }}
        />
        <Tab.Screen
          name="Menu"
          component={Menu}
          options={{
            title: 'Menu',
            tabBarLabel: 'Menu',
            tabBarIcon: () => <TabIcon Icon={MenuSvg} />,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MyTabs;
