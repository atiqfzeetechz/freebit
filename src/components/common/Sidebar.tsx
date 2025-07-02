// Sidebar.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useSidebar} from '../../context/SidebarContext';
import {useWebView} from '../../context/WebviewContext';
// import {useSidebar} from '../context/SidebarContext';
// import {useWebView} from '../context/WebviewContext';

const {width} = Dimensions.get('window');

export default function Sidebar() {
  const {visible, slideAnim, closeSidebar} = useSidebar();
  const {triggerLogout} = useWebView();
  const navigation = useNavigation();

  const menuItems = [
    {label: 'Profile', icon: 'person', route: 'menu'},
    {label: 'Withdrawal', icon: 'attach-money', route: 'Withdrawal'},
    {
      label: 'Change Withdrwal Address',
      icon: 'report',
      route: 'changeWithdrawlAddress',
    },
    {label: 'Withdrawal Report', icon: 'report', route: 'WithdrawalReports'},
    {label: 'Level Reports', icon: 'assessment', route:"levelreports"},
  ];

  const handleItemPress = route => {
    closeSidebar(() => {
      if (route === 'menu') {
        navigation.navigate('Main', {screen: 'menu'});
      } else {
        navigation.navigate(route);
      }
    });
  };

  return (
    <Modal transparent visible={visible} onRequestClose={() => closeSidebar()}>
      <TouchableWithoutFeedback onPress={() => closeSidebar()}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.modalMenu, {transform: [{translateX: slideAnim}]}]}>
            <TouchableWithoutFeedback>
              <View>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>Menu</Text>
                </View>

                {menuItems.map(({label, icon, route}, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    onPress={() => handleItemPress(route)}>
                    <Icon name={icon} size={20} style={styles.menuIcon} />
                    <Text style={styles.menuText}>{label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={triggerLogout}>
                  <Icon name="logout" size={20} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => closeSidebar()}>
                  <Icon name="close" size={20} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalMenu: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: 'white',
  },
  menuHeader: {
    height: 150,
    backgroundColor: '#6200ee',
    justifyContent: 'flex-end',
    padding: 20,
  },
  menuTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    marginRight: 15,
    color: '#6200ee',
  },
  menuText: {
    fontSize: 16,
  },
});
