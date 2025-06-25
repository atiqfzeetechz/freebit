import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useSidebar} from '../context/SidebarContext';
import {Appbar} from 'react-native-paper';
import Profile from './Profile';

export default function Menu() {
  const {openSidebar} = useSidebar();
  return <Profile />;
}

const styles = StyleSheet.create({});
