import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {hp} from '../helper/hpwp';
import useAxios from '../hooks/useAxios';

export default function WebSync() {
  const [refreshing, setRefreshing] = useState(false);
  const webViewRef = useRef(null);
  const {fetchData} = useAxios();

  const onRefresh = () => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const callAPi = async () => {
    try {
      const data = await fetchData({
        url: '/captcha/token',
      });

      if (data?.data) {
        const token = data.data;
        console.log('CAPTCHA Token:', token);

        webViewRef.current?.injectJavaScript(`
          (function() {
            const captchaField = document.querySelector('[name="cf-turnstile-response"]');
            if (captchaField) {
              captchaField.value = '${token}';
              setTimeout(() => {
                const rollButton = document.querySelector('#free_play_form_button');
                if (rollButton && !rollButton.disabled) {
                  rollButton.click();
                }
              }, 500);
            }
          })();
          true;
        `);
      }
    } catch (error) {
      console.log('Error fetching CAPTCHA:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      const header = document.getElementById('header');
      if (header) {
        header.style.display = 'none';
      }

      const rollButton = document.querySelector('#free_play_form_button');
      if (rollButton) {
        window.ReactNativeWebView.postMessage('roll_button_found');
      }

      // Detect CAPTCHA (Cloudflare Turnstile or similar)
      const captcha = document.querySelector('[name="cf-turnstile-response"]') || document.querySelector('.cf-challenge');
      if (captcha) {
        window.ReactNativeWebView.postMessage('captcha_detected');
      }
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <WebView
          ref={webViewRef}
           source={{ uri: 'https://freebitco.in/' }}
          style={styles.webview}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          allowsBackForwardNavigationGestures={true}
          onMessage={event => {
            // const data = event.nativeEvent.data;

            // if (data === 'roll_button_found') {
            //   console.log('Roll button is present!');
            //   callAPi();
            // }

            // if (data === 'captcha_detected') {
            //   console.log('CAPTCHA detected, opening in browser...');
            //   Linking.openURL('https://freebitco.in/');
            // }
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(5),
  },
  webview: {
    flex: 1,
  },
});


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
