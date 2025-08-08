import React, { memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const Tab = createBottomTabNavigator();

// Memoized icon component to avoid re-rendering
const TabIcon = memo(({ Icon }) => <Icon height={26} width={26} />);

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        lazy: true, // Loads screens only when needed
        tabBarStyle: { backgroundColor: '#fff', height: 60 },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#888',
      }}
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
  );
}

export default MyTabs;
