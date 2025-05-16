import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../Home';
import Profile from '../Profile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthProvider} from '../../context/AuthContext';
import RollHistory from '../RollHistory';
import WebSync from '../WebSync';
import Refer from './Refer';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Icon name="home" size={30} color="gray"></Icon>,
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="RollHistory"
        component={RollHistory}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Icon name="history" size={30} color="gray"></Icon>,
          title: 'Roll History',
        }}
      />
      <Tab.Screen
        name="sync"
        component={WebSync}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Icon name="sync" size={30} color="gray"></Icon>,
          headerShown: false,
        }}
      />
     
      <Tab.Screen
        name="refer"
        component={Refer}
        options={{
          title :"Refer & Earn",
          tabBarLabel: 'Refer&Earn',
          animation: 'shift',
          tabBarIcon: () => (
            <FontAwesome6
              name="people-group"
              size={25}
              color="gray"></FontAwesome6>
          ),
        }}
      />
       <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          animation: 'shift',
          tabBarIcon: () => <Icon name="person" size={30} color="gray"></Icon>,
        }}
      />
    </Tab.Navigator>
  );
}

export default MyTabs; // Only export here
