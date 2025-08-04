// src/context/SidebarContext.js
import React, {createContext, useState, useRef, useContext} from 'react';
import {Animated, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const SidebarContext = createContext(null);

export const SidebarProvider = ({children}:any) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const openSidebar = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = (callback:any) => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      callback && callback();
    });
  };

  return (
    <SidebarContext.Provider value={{visible, slideAnim, openSidebar, closeSidebar}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
