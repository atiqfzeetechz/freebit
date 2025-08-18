import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useSidebar } from '../../context/SidebarContext';
import { useWebView } from '../../context/WebviewContext';
import useAxios from '../../hooks/useAxios';

const { width } = Dimensions.get('window');

export default function Sidebar() {
  const { visible, slideAnim, closeSidebar } = useSidebar();
  const { triggerLogout } = useWebView();
  const navigation = useNavigation();
  const { fetchData } = useAxios();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false); // close modal first
    const res = await fetchData({
      url: `/user/auth/logout`,
      method: 'PUT',
      data: {
        type: 'logout',
      },
    });
    if (res?.data.success) {
      triggerLogout();
    }
  };

  const menuItems = [
    { label: 'Profile', icon: 'person', route: 'menu' },
    { label: 'Withdrawal', icon: 'attach-money', route: 'Withdrawal' },
    {
      label: 'Change Withdrwal Address',
      icon: 'report',
      route: 'changeWithdrawlAddress',
    },
    { label: 'Withdrawal Report', icon: 'report', route: 'WithdrawalReports' },
    { label: 'Level Reports', icon: 'assessment', route: 'levelreports' },
    { label: 'Teams Rolls', icon: 'assessment', route: 'levelRolls' },
  ];

  const handleItemPress = route => {
    closeSidebar(() => {
      if (route === 'menu') {
        navigation.navigate('Main', { screen: 'menu' });
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
            style={[
              styles.modalMenu,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <TouchableWithoutFeedback>
              <View>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>Menu</Text>
                </View>

                {menuItems.map(({ label, icon, route }, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    onPress={() => handleItemPress(route)}
                  >
                    <Text style={styles.menuText}>{label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setLogoutModalVisible(true)}
                >
                  <Text style={styles.menuText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => closeSidebar()}
                >
                  <Text style={styles.menuText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Confirm Logout Modal */}
          <Modal transparent visible={logoutModalVisible} animationType="fade">
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Confirm Logout</Text>
                <Text style={styles.confirmText}>Are you sure you want to logout?</Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: '#6200ee' }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.confirmButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: '#ccc' }]}
                    onPress={() => setLogoutModalVisible(false)}
                  >
                    <Text style={[styles.confirmButtonText, { color: '#000' }]}>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  menuText: {
    fontSize: 16,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
