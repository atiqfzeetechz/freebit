import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../hooks/useAuth';
import { Card, Text, useTheme, Avatar, IconButton } from 'react-native-paper';
import { hp } from '../helper/hpwp';
import { showNotification } from '../utils/Notify';
import { useWebView } from '../context/WebviewContext';
import { useLastSyncDisplay } from '../hooks/useLastSync';

export default function DashBoard({ webViewData,showModalTrue, setShowModalTrue }: any) {
  const { fetchData } = useAxios();
  const { setuserDetails, userDetails } = useAuth();
  const { triggerLogout } = useWebView();
  const theme = useTheme();
  // const lastSync = useLastSyncDisplay();
  const [lastRollTime, setLastRollTime] = useState(
    userDetails?.lastRollTime || new Date().toISOString(),
  );
  const [countdown, setCountdown] = useState({ minutes: '00', seconds: '00' });
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const getMe = async () => {
    console.log('calling getMe')
    try {
      const res = await fetchData({
        url: '/user/auth/me',
        loader: true,
      });
      console.log("userData",res);
      const data = res?.data
      console.log(data)
   
      if(res.data.success){
    const isvaliduser = data.data?.isValidUser;
    
      if (isvaliduser == 'invalid') {
        // showNotification('You cannot use Our Platform ', 'error')
        triggerLogout();
      }
      setuserDetails(data.data);
      console.log(data.data)
        if(!data.data.isLoggedIn){
        
          setShowModalTrue(true)
      }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMe();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // Update countdown when webViewData changes
  useEffect(() => {
    if (webViewData?.timer) {
      // Clear any existing interval
      if (timerInterval) clearInterval(timerInterval);

      // Set initial countdown values
      setCountdown(webViewData.timer);

      // Start decreasing the timer every second
      const interval = setInterval(() => {
        setCountdown(prev => {
          let mins = parseInt(prev.minutes);
          let secs = parseInt(prev.seconds);

          // Decrease seconds
          secs -= 1;

          // Handle minute rollover
          if (secs < 0) {
            mins -= 1;
            secs = 59;
          }

          // Stop at zero
          if (mins < 0) {
            clearInterval(interval);
            return { minutes: '00', seconds: '00' };
          }

          return {
            minutes: mins.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0'),
          };
        });
      }, 1000);

      setTimerInterval(interval);
    }
  }, [webViewData]);

  // Format countdown timer
  const formatCountdown = () => {
    return `${countdown.minutes}:${countdown.seconds}`;
  };

  // Sample data for the cards
  const cardData = [
    {
      id: '1',
      title: 'Wallet',
      icon: 'wallet',
      value: webViewData?.balance || '0',
    },
    {
      id: '2',
      title: 'Referrals',
      icon: 'account-group',
      value: userDetails?.referralCount || 0,
    },
    {
      id: '3',
      title: 'Email Verified',
      icon: 'email-check',
      value: userDetails?.isEmailVerified ? 'Yes' : 'No',
    },
    {
      id: '4',
      title: '2FA',
      icon: 'shield-check',
      value: userDetails?.is2FAEnabled ? 'Enabled' : 'Disabled',
    },
    {
      id: '5',
      title: 'Joined',
      icon: 'calendar',
      value: new Date(userDetails?.createdAt).toLocaleDateString(),
    },
    {
      id: '6',
      title: 'Promotions',
      icon: 'tag',
      value: userDetails?.emailSubscriptions?.promotions ? 'On' : 'Off',
    },
    {
      id: '7',
      title: 'Referral Code',
      icon: 'qrcode',
      value: userDetails?.referralCode || 'N/A',
    },
    {
      id: '8',
      title: 'Next Roll In',
      icon: 'clock-outline',
      value: '',
      isTimer: true,
    },
  ];
  function syncReCallwebView() {
    // showLoader()
    // setSyncWebViewclick(SyncWebViewClick + 1)
  }
  // Calculate card width based on screen width
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { width: cardWidth }]}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon
          size={40}
          icon={item.icon}
          style={styles.cardIcon}
          color={theme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.cardTitle}>
          {item.title}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.cardValue, item.isTimer ? styles.timerText : null]}
        >
          {item.value}
        </Text>
      </Card.Content>
    </Card>
  );

 

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <StatusBar backgroundColor="#4e91fc" barStyle="light-content" /> */}

      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.topRow}>
        <Text style={styles.headerText}>Sync Details</Text>
        <Text onPress={syncReCallwebView} style={styles.status}><IconButton
  icon={'sync'}
  /></Text>
      </View>
        <Text style={styles.headerText}>Sync Details</Text>
      </View> */}
      <View style={styles.container}>
        {/* Grid Cards */}
        <FlatList
          data={cardData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={countdown} // Re-render when countdown changes
        />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: hp(5),
    marginTop: hp(5),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginLeft: 5,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardIcon: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  cardTitle: {
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerText: {
    color: '#6200EE',
    fontSize: 16,
  },
});
