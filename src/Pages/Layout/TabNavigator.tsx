import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Home';
import Profile from '../Profile';
import { AuthProvider } from '../../context/AuthContext';
import RollHistory from '../RollHistory';
import WebSync from '../WebSync';
import Refer from './Refer';
import Withdrawal from '../Withdrawal';
import Menu from '../Menu';
import { Text } from 'react-native';
import Sync from '../../../assets/svg/sync.svg'

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="RollHistory"
        component={RollHistory}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📜</Text>,
          title: 'Roll History',
        }}
      />
      <Tab.Screen
        name="sync"
        component={WebSync}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Sync
          height={30}
          
          />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="refer"
        component={Refer}
        options={{
          title: 'Refer & Earn',
          tabBarLabel: 'Refer&Earn',
          animation: 'shift',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="menu"
        component={Menu}
        options={{
          title: 'Menu',
          headerShown: false,
          tabBarLabel: 'Menu',
          animation: 'shift',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default MyTabs;
