import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect} from 'react';

import {style} from '../utils/styles';
import UserProfile from '../components/Profile';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Button, Icon, IconButton, MD3Colors} from 'react-native-paper';
import {useAuth} from '../hooks/useAuth';
import {wp} from '../helper/hpwp';
import {useWebView} from '../context/WebviewContext';

import {Appbar} from 'react-native-paper';
import {useSidebar} from '../context/SidebarContext';
import useAxios from '../hooks/useAxios';
import MenuSvg from '../../assets/svg/menu.svg'

export default function Profile() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {logout} = useAuth();
  const {triggerLogout} = useWebView();
  const {openSidebar} = useSidebar();
  const {fetchData}=useAxios()

  const handleLogout = async () => {
    const  res =await  fetchData({
      url:`/user/auth/logout`,
      method:'PATCH'
    })
    console.log(res)
    // triggerLogout();
    // logout()
    // navigation.navigate('Home')
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
      headerRight: () => (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleLogout()} // Add your logout function here
        >
          {/* <MaterialCommunityIcons 
    name="logout" 
    size={24} 
    color="#fff" 
    style={styles.logoutIcon}
  /> */}
          <IconButton icon={'logout'} />
          {/* <Text style={styles.logoutText}>Logout</Text> */}
        </TouchableOpacity>
      ),
    });
  }, [isFocused]);

  return (
    <View
      style={[
        style.container,
        {
          width: wp(100),
        },
      ]}>
      <Appbar.Header
        style={{
          width: wp(100),
        }}>
        <Appbar.Action icon={
          ()=><View>
            <MenuSvg width={25}  height={25}/>
          </View>
        }
          
          onPress={openSidebar} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      <UserProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {},
});
