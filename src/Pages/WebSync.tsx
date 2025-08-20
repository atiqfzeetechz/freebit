// import React, {useState, useRef} from 'react';
// import {
//   StyleSheet,
//   View,
//   ScrollView,
//   RefreshControl,
//   Linking,
// } from 'react-native';
// import {WebView} from 'react-native-webview';
// import {hp} from '../helper/hpwp';
// import useAxios from '../hooks/useAxios';

// export default function WebSync() {
//   const [refreshing, setRefreshing] = useState(false);
//   const webViewRef = useRef(null);
//   const {fetchData} = useAxios();

//   const onRefresh = () => {
//     setRefreshing(true);
//     webViewRef.current?.reload();
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1000);
//   };

//   const callAPi = async () => {
//     try {
//       const data = await fetchData({
//         url: '/captcha/token',
//       });

//       if (data?.data) {
//         const token = data.data;
//         console.log('CAPTCHA Token:', token);

//         webViewRef.current?.injectJavaScript(`
//           (function() {
//             const captchaField = document.querySelector('[name="cf-turnstile-response"]');
//             if (captchaField) {
//               captchaField.value = '${token}';
//               setTimeout(() => {
//                 const rollButton = document.querySelector('#free_play_form_button');
//                 if (rollButton && !rollButton.disabled) {
//                   rollButton.click();
//                 }
//               }, 500);
//             }
//           })();
//           true;
//         `);
//       }
//     } catch (error) {
//       console.log('Error fetching CAPTCHA:', error);
//     }
//   };

//   const injectedJavaScript = `
//     (function() {
//       const header = document.getElementById('header');
//       if (header) {
//         header.style.display = 'none';
//       }

//       const rollButton = document.querySelector('#free_play_form_button');
//       if (rollButton) {
//         window.ReactNativeWebView.postMessage('roll_button_found');
//       }

//       // Detect CAPTCHA (Cloudflare Turnstile or similar)
//       const captcha = document.querySelector('[name="cf-turnstile-response"]') || document.querySelector('.cf-challenge');
//       if (captcha) {
//         window.ReactNativeWebView.postMessage('captcha_detected');
//       }
//     })();
//     true;
//   `;

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         contentContainerStyle={{flex: 1}}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }>
//         <WebView
//           ref={webViewRef}
//            source={{ uri: 'https://freebitco.in/' }}
//           style={styles.webview}
//           javaScriptEnabled={true}
//           injectedJavaScript={injectedJavaScript}
//           domStorageEnabled={true}
//           startInLoadingState={true}
//           mixedContentMode="compatibility"
//           allowsBackForwardNavigationGestures={true}
//           onMessage={event => {
//             // const data = event.nativeEvent.data;

//             // if (data === 'roll_button_found') {
//             //   console.log('Roll button is present!');
//             //   callAPi();
//             // }

//             // if (data === 'captcha_detected') {
//             //   console.log('CAPTCHA detected, opening in browser...');
//             //   Linking.openURL('https://freebitco.in/');
//             // }
//           }}
//         />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: hp(5),
//   },
//   webview: {
//     flex: 1,
//   },
// });

// --------------------------------------------end------------------------------------------------------

// ----------------------------------start--------------------------------------------------

// import React from 'react';
// import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
// import WebView from 'react-native-webview';

// const App = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <WebView
//         source={{ uri: 'https://freebitco.in/' }}
//         style={styles.webview}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         startInLoadingState={true}
//         mixedContentMode="always"
//         injectedJavaScript={`
//           // This code runs in the WebView's context
//           document.body.style.backgroundColor = 'red';
//           true; // Required for onMessage to work
//         `}
//         onMessage={(event) => {
//           console.log('Message from WebView:', event.nativeEvent.data);
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webview: {
//     flex: 1,
//     marginTop:StatusBar.currentHeight
//   },
// });

// export default App;

// ------------------------------------------------------------end---------------------------------------------

// ------------------------------------------------------------------start ----------------------
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import useAxios from '../hooks/useAxios';
import {useAuth} from '../hooks/useAuth';
import {useWebView} from '../context/WebviewContext';
import {Appbar, IconButton} from 'react-native-paper';
import {useLoader} from '../hooks/useLoader';
import {useData} from '../hooks/useGlobalData';
import {convertScientificToDecimal, formatBTC} from '../utils/NumerConvertor';
import Sync from '../../assets/svg/sync.svg'
import { wp } from '../helper/hpwp';
import { webViewRef } from '../utils/globalWebViewRef';
import { useNavigation } from '@react-navigation/native';
import { useGlobalRef } from '../hooks/useGlobalRef';
import ReloadSvg from '../../assets/svg/colored-refresh.svg';
import { handleReloadWebView } from '../utils/webViewHelper';

const data = [

  {title: 'WOF Bonus', value: '00:00:00'},
  {title: 'Free BTC Bonus', value: '00:00:00'},
  {title: 'FUN Bonus', value: '00:00:00'},
  {title: 'Lottery Bonus', value: '00:00:00'},
  // {title: 'Last Sync', value: '00:21:46'},
];


const DashboardScreen = () => {
 const {fetchData} = useAxios();
  const {webViewRef}=useGlobalRef()
  const {stats, setStats, lastSync, setLastSync} = useData();
  const [lavelBalance, setLavelBalance] = useState(0);
  const {setuserDetails, userDetails, btBalance, setBTbalance} = useAuth();
  const {SyncWebViewClick, setSyncWebViewclick} = useWebView();
  const {showLoader, hideLoader} = useLoader();
  const [countdown, setCountdown] = useState({minutes: '00', seconds: '00'});
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastSyncDisplay, setLastSyncDisplay] = useState('Never synced');
  const [teamsRolls,setTeamRolls]=useState('')

  const navigation = useNavigation()

  // const [lastSync,setlastSync]=useState('')


 const formatLastSync = (syncTime: string) => {
  if (!syncTime) return "Never synced";
  
  const lastSync = new Date(syncTime);
  const now = new Date();
  const diffInSeconds = Math.floor((now - lastSync) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const remainingSeconds = diffInSeconds % 60;
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}:${remainingSeconds} `;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    const remainingMinutes = diffInMinutes % 60;
    return `${diffInHours}:${remainingMinutes}:${remainingSeconds}`;
  }
};

const updateLastSyncDisplay = () => {
  if (lastSync) {
    setLastSyncDisplay(formatLastSync(lastSync));
  }
};

const getDownlineRollCount = async ()=>{
  const res = await fetchData({
    url:"/user/auth/downlinerolls?timeframe=today",
    method:"GET"
  })
  const response = res.data
  if(response.success){

    setTeamRolls(response.data)
  }
  console.log(response)
}

useEffect(() => {
  updateLastSyncDisplay(); // Initial update
  getDownlineRollCount() 
  
  // Update every second for more accurate timing
  const interval = setInterval(() => {
    updateLastSyncDisplay();
  }, 1000); // Update every second
  
  return () => clearInterval(interval); // Cleanup on unmount
}, [lastSync]);


  const myReferral = async () => {
    try {
      const response = await fetchData({
        url: `/user/income/distributeincom/${userDetails?.email}`,
      });
      console.log(response);

      // if (response.data?.success) {
      setLavelBalance(response?.data?.wallet?.balance || 0);
      // console.log(response?.data?.wallet?.balance)
      // }
    } catch (error) {
      console.log(error);
      // setSnackbarMessage('Failed to fetch referral data');
      // setVisibleSnackbar(true);
    }
  };

  useEffect(() => {
    myReferral();
  }, [SyncWebViewClick]);

  function syncReCallwebView() {
  handleReloadWebView(webViewRef)
    // showLoader();
    // setSyncWebViewclick(SyncWebViewClick + 1);
    const timestamp = new Date().toISOString(); // or use new Date().toLocaleString()
    console.log('Sync clicked at:', timestamp);
    setLastSync(timestamp)
     setLastSyncDisplay("Just now")
  }

  useEffect(() => {
    if (btBalance) {
      // Clear any existing interval
      if (timerInterval) clearInterval(timerInterval);

      // Set initial countdown values
      setCountdown({minutes: btBalance?.minutes, seconds: btBalance?.seconds});

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
            return {minutes: '00', seconds: '00'};
          }

          return {
            minutes: mins.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0'),
          };
        });
      }, 1000);

      setTimerInterval(interval);
      // ✅ Clean up on unmount or btBalance change
    }
  }, [btBalance]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4e91fc" barStyle="light-content" />

      {/* Header */}
      {/* <View style={styles.header}>
        <View style={[styles.topRow , {
          width:wp(95),
        }]}>
          <Text style={styles.headerText}>Sync Details</Text>
          <TouchableOpacity  onPress={syncReCallwebView}
          style={{
          
           marginRight:50
          }}
          >
             <Sync
          height={30}
          width={30}
          
          />
          </TouchableOpacity>
        
        </View>

      </View> */}
       <Appbar.Header>
              <Appbar.Content title="Sync" titleStyle={{
            fontSize: 18,
            fontWeight: '800',
          }} />

              <Appbar.Action
                icon={() => (
                  <TouchableOpacity
                    onPress={() => {
                      syncReCallwebView();
                    }}
                  >
                    <ReloadSvg width={25} height={25} />
                  </TouchableOpacity>
                )}
              />
            </Appbar.Header>

      {/* Grid Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* {data.map((item, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.title}>{item.title}</Text>
            <Text
              style={[
                styles.value,
                item.value === 'Enabled' && styles.enabled,
                item.value === 'Disabled' && styles.disabled,
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))} */}
        <View style={styles.box}>
          <Text style={styles.title}>Balance (BTC)</Text>
          <Text
            style={[
              styles.value,
              // item.value === 'Enabled' && styles.enabled,
              // item.value === 'Disabled' && styles.disabled,
            ]}>
            {btBalance?.balance}
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.title}>Balance (FUN)</Text>
          <Text style={[styles.value]}>114</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.title}>Balance (Wallet)</Text>
          <Text style={[styles.value]}>
            {formatBTC  (lavelBalance)}
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.title}>Reward Points</Text>
          <Text style={[styles.value]}>{stats?.rewards} RP</Text>
        </View>
        <View style={styles.box}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Lottery</Text>
            <Text style={styles.status}>
              {' '}
              {stats.isLotteryDisbaled ? 'Disabled' : 'Enabled'}
            </Text>
          </View>
          <Text style={styles.value}>{stats.tickets} T</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.title}>2FA Security</Text>
          <Text
            style={[
              styles.value,
              stats.twoFaStatus === 'ENABLED' && styles.enabled,
              stats.twoFaStatus === 'DISABLED' && styles.disabled,
            ]}>
            {stats.twoFaStatus}
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.title}>Next Roll</Text>
          <Text style={[styles.value]}>
            {`${countdown.minutes}:${countdown.seconds}`}
            {/* {btBalance?.minutes} : {btBalance?.seconds} */}
          </Text>
        </View>
        <View style={styles.box}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Larger Bonuses</Text>
            <Text style={styles.status}>?</Text>
          </View>
          <Text
            style={[
              styles.value,
              styles.enabled,
              // userDetails?.is2FAEnabled === false && styles.disabled,
            ]}>
            Enabled
          </Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.title}>{item.title}</Text>
            <Text
              style={[
                styles.value,
                item.value === 'Enabled' && styles.enabled,
                item.value === 'Disabled' && styles.disabled,
              ]}>
              {item.value}
            </Text>
          </View>
        ))}
         <View style={styles.box}>
          <Text style={styles.title}>Last Sync </Text>
          <Text style={[styles.value]}>{lastSyncDisplay}</Text>
        </View>
        <TouchableOpacity style={styles.box}
        onPress={()=>navigation.navigate('levelRolls')}
        >
          <Text style={styles.title}>Team Rolls (today)</Text>
          <Text style={[styles.value]}>
            {teamsRolls?.totalCount} 👉🏾
            {/* {btBalance?.minutes} : {btBalance?.seconds} */}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    marginTop:StatusBar.currentHeight
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
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  box: {
    width: '48%',
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 1, height: 2},
    shadowRadius: 4,
  },
  title: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  enabled: {
    color: 'green',
  },
  disabled: {
    color: 'red',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width:wp(90)
  },

  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
    
  },
});

export default DashboardScreen;

// --------------------------------------------------------------------END--------------------------------------

// import React from 'react'
// import { View } from 'react-native'
// import DashBoard from '../components/DashBoard'
// import { useWebView } from '../context/WebviewContext';

// function WebSync() {
//     const {webViewData, setWebViewData} = useWebView();

//   return (
//     <View
//             style={[
//               {
//                 position: 'absolute',
//               },
//               // ViewStyle?.dashboard,
//             ]}>
//             <DashBoard webViewData={webViewData} />
//           </View>
//   )
// }

// export default WebSync
