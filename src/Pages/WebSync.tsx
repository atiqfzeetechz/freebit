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

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../hooks/useAuth';

const data = [
  // { title: 'Balance (BTC)', value: '0.00 000 0096' },
  // { title: 'Balance (FUN)', value: '600' },
  // { title: 'Wallet Blance', value: '0.0000000034' },
  // { title: 'Reward Points', value: '94 663 RP' },
  // { title: 'WOF Spins', value: '272 WOF' },
  // { title: 'Lottery', value: 'Disabled' },
  // { title: '2FA Security', value: 'Enabled' },
  // { title: 'Larger Bonuses', value: 'Enabled' },
  // { title: 'Remove Captcha', value: '0.00 013 286' },
  // { title: 'Next Roll', value: '38:11' },
  { title: 'WOF Bonus', value: '00:00:00' },
  { title: 'Free BTC Bonus', value: '00:00:00' },
  { title: 'FUN Bonus', value: '00:00:00' },
  { title: 'Lottery Bonus', value: '00:00:00' },
  { title: 'Last Sync', value: '00:21:46' },
];


const DashboardScreen = () => {

const {fetchData} = useAxios();
const [lavelBalance, setLavelBalance] = useState(0);
const {setuserDetails, userDetails,btBalance, setBTbalance} = useAuth();
console.log(userDetails)
console.log(btBalance)
const myReferral = async () => {
    try {
      const response = await fetchData({
        url: `/user/income/distributeincom/${userDetails?.email}`,
      });
      console.log(response)
      
      // if (response.data?.success) {
        setLavelBalance(response?.data?.wallet?.balance || 0);
      // }
    } catch (error) {
      console.log(error)
      // setSnackbarMessage('Failed to fetch referral data');
      // setVisibleSnackbar(true);
    }
  };

useEffect(()=>{
  myReferral()
},[])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4e91fc" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Sync Details</Text>
      </View>

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
        <View  style={styles.box} >
            <Text style={styles.title} >Balance (BTC)</Text>
            <Text
              style={[
                styles.value,
                // item.value === 'Enabled' && styles.enabled,
                // item.value === 'Disabled' && styles.disabled,
              ]}
            >
              {btBalance?.balance}
            </Text>
          </View>
        <View  style={styles.box} >
            <Text style={styles.title} >Balance (FUN)</Text>
            <Text
              style={[
                styles.value
              ]}
            >
             114 
            </Text>
          </View>
        <View  style={styles.box} >
            <Text style={styles.title} >Balance (Wallet)</Text>
            <Text
              style={[
                styles.value
              ]}
            >
              {lavelBalance}
            </Text>
          </View>
        <View  style={styles.box} >
            <Text style={styles.title} >Reward Points</Text>
            <Text
              style={[
                styles.value
              ]}
            >
              4600 RP
            </Text>
          </View>
        <View style={styles.box}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Lottery</Text>
        <Text style={styles.status}>Disabled</Text>
      </View>
      <Text style={styles.value}>53 T</Text>
    </View>
        <View  style={styles.box} >
            <Text style={styles.title} >2FA Security</Text>
            <Text
              style={[
                styles.value,
                userDetails?.is2FAEnabled === true && styles.enabled,
                userDetails?.is2FAEnabled === false && styles.disabled,
              ]}
            >
              {userDetails?.is2FAEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        <View  style={styles.box} >
            <Text style={styles.title} >Next Roll</Text>
            <Text
              style={[
                styles.value
              ]}
            >
              {btBalance?.minutes} : {btBalance?.seconds}
            </Text>
          </View>
        <View  style={styles.box} >
           
            <View style={styles.topRow}>
            <Text style={styles.title} >Larger Bonuses</Text>
            <Text style={styles.status}>?</Text>
            </View>
            <Text
              style={[
                styles.value,
               styles.enabled,
                // userDetails?.is2FAEnabled === false && styles.disabled,
              ]}
            >
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
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    shadowOffset: { width: 1, height: 2 },
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
    textAlign:'center',
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
  },
  
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
  },
 
});

export default DashboardScreen;
