import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  NativeModules,
  AppState,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../hooks/useAuth';

const FixNowModal = ({
  visible = false,
  onClose,
  title = 'App Status',
  buttonText = 'Continue',
  onButtonPress,
  showCloseButton = true,
  checkNotificationStatus = true,
}) => {
  const [notificationStatus, setNotificationStatus] = useState({
    enabled: null,
    permissionStatus: null,
    isBlocked: false,
  });
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const { fetchData } = useAxios();
  const { userDetails, setuserDetails } = useAuth();

  useEffect(() => {
    if (visible && checkNotificationStatus) {
      checkNotificationPermissions();
    }
  }, [visible, checkNotificationStatus]);

  useEffect(() => {
    if (
      notificationStatus.enabled &&
      !notificationStatus.isBlocked &&
      userDetails?.fcmToken &&
      userDetails?.isLoggedIn
    ) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notificationStatus, userDetails]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && visible) {
        checkNotificationPermissions();
      }
    });

    return () => subscription.remove();
  }, [visible]);

  const fixNow = async () => {
    try {
      setIsFixing(true);
      const token = await messaging().getToken();
      const res = await fetchData({
        url: '/user/auth/fixissue',
        method: 'PATCH',
        data: {
          fcmToken: token,
          isLoggedIn: true,
        },
      });
      
      if (res?.data.success) {
        setuserDetails(res?.data.data);
        setIsFixed(true);
        setTimeout(() => {
          onClose();
          setIsFixed(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fixing issue:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const notifeeSettings = await notifee.getNotificationSettings();
      const isBlocked = notifeeSettings.authorizationStatus === -1;

      setNotificationStatus({
        enabled,
        permissionStatus: notifeeSettings.authorizationStatus,
        isBlocked,
      });
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setNotificationStatus({
        enabled: false,
        permissionStatus: -1,
        isBlocked: false,
      });
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      const pkg = 'com.yourapp'; // Replace with your app package name
      try {
        NativeModules.IntentLauncher.startActivity({
          action: 'android.settings.APP_NOTIFICATION_SETTINGS',
          extras: {
            'android.provider.extra.APP_PACKAGE': pkg,
          },
        });
      } catch (e) {
        Linking.openSettings();
      }
    } else {
      Linking.openSettings();
    }
  };

  const renderStatusItem = (icon, text, condition) => {
    return (
      <View style={styles.statusItem}>
        <Text style={[styles.iconText, condition ? styles.successIcon : styles.errorIcon]}>
          {condition ? '✓' : '✕'}
        </Text>
        <Text style={styles.statusText}>
          {icon} {text}
        </Text>
      </View>
    );
  };

  const renderStatusDetails = () => {
    const { enabled, isBlocked } = notificationStatus;

    if (isFixed) {
      return (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>All issues fixed successfully!</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        {/* Notification Status */}
        <View style={styles.statusItem}>
          <Text style={[
            styles.iconText,
            enabled === null ? styles.loadingIcon :
            isBlocked ? styles.errorIcon :
            enabled ? styles.successIcon : styles.errorIcon
          ]}>
            {enabled === null ? '🔄' : isBlocked ? '✕' : enabled ? '✓' : '✕'}
          </Text>
          <Text style={styles.statusText}>
            Notifications: {enabled === null ? 'Checking...' : isBlocked ? 'Blocked' : enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        {/* FCM Token */}
        {renderStatusItem('🔑', `FCM Token: ${userDetails?.fcmToken ? 'Available' : 'Missing'}`, userDetails?.fcmToken)}

        {/* Login Status */}
        {renderStatusItem('👤', `Logged In: ${userDetails?.isLoggedIn ? 'Yes' : 'No'}`, userDetails?.isLoggedIn)}
      </View>
    );
  };

  const getActionButtons = () => {
    if (isFixed) return null;

    const { enabled, isBlocked } = notificationStatus;

    if (enabled === null) {
      return (
        <View style={[styles.actionButton, styles.loadingButton]}>
          <ActivityIndicator color="#ffffff" />
          <Text style={styles.actionButtonText}>Checking...</Text>
        </View>
      );
    }

    if (isBlocked) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.settingsButton]}
          onPress={openNotificationSettings}
        >
          <Text style={styles.actionButtonText}>⚙️ Open Settings</Text>
        </TouchableOpacity>
      );
    }

    if (!enabled) {
      return (
        <>
          <TouchableOpacity
            style={[styles.actionButton, styles.enableButton]}
            onPress={openNotificationSettings}
          >
            <Text style={styles.actionButtonText}>🔔 Enable Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onClose}
          >
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.actionButton, styles.fixButton]}
        onPress={fixNow}
        disabled={isFixing}
      >
        {isFixing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.actionButtonText}>✓ Fix Now</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          {renderStatusDetails()}
          <View style={styles.buttonGroup}>
            {getActionButtons()}
          </View>
          {showCloseButton && !isFixed && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: windowWidth * 0.85,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  statusContainer: {
    width: '100%',
    marginBottom: 25,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 20,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#34495e',
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successIcon: {
    fontSize: 48,
    color: '#2ecc71',
    marginBottom: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2ecc71',
  },
  errorIcon: {
    color: '#e74c3c',
  },
  loadingIcon: {
    color: '#3498db',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  enableButton: {
    backgroundColor: '#3498db',
  },
  settingsButton: {
    backgroundColor: '#e74c3c',
  },
  fixButton: {
    backgroundColor: '#2ecc71',
  },
  loadingButton: {
    backgroundColor: '#95a5a6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#95a5a6',
    fontWeight: 'bold',
  },
});

export default FixNowModal;