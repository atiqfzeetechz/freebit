import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'

import { style } from '../utils/styles'
import UserProfile from '../components/Profile'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { Button, Icon, IconButton, MD3Colors } from 'react-native-paper'
import { useAuth } from '../hooks/useAuth'
import { wp } from '../helper/hpwp'

export default function Profile() {
  const navigation = useNavigation()
  const isFocused=  useIsFocused()
const  {logout} =useAuth()

const handleLogout =()=>{
  logout()
  navigation.navigate('Home')
}
  
  useEffect(()=>{ 
navigation.setOptions(({
  title:"Profile",
  headerRight:()=><TouchableOpacity 
  style={styles.logoutButton}
  onPress={() => handleLogout()} // Add your logout function here
>
  {/* <MaterialCommunityIcons 
    name="logout" 
    size={24} 
    color="#fff" 
    style={styles.logoutIcon}
  /> */}
  <IconButton
  icon={'logout'}
  />
  {/* <Text style={styles.logoutText}>Logout</Text> */}
</TouchableOpacity>
}))
  },[isFocused])

  return (
    <View style={[style.container,{
      width:wp(100)
    }]}>
      <UserProfile/>
    </View>
  )
}

const styles = StyleSheet.create({
  logoutButton:{

  }
})