import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {hp} from '../helper/hpwp';
import {useAuth} from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import DashBoard from '../components/DashBoard';
import useAxios from '../hooks/useAxios';
import {showNotification} from '../utils/Notify';
import {useIsFocused} from '@react-navigation/native';
import notifee from '@notifee/react-native';
import useTheme from '../hooks/useTheme';
import useBgFetch from '../hooks/useBgfetch';

const formatDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    fullDateTime: now.toLocaleString(),
  };
};

export const scheduleNotification = async (message = 'Hii') => {
  const {date, time, fullDateTime} = formatDateTime();
  // Create a channel (required for Android)

  try {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.requestPermission();

    // Sometime later...
    await notifee.displayNotification({
      id: `${Date.now().toString()}`,
      title: `New Roll`,
      body: `Rolled at: ${fullDateTime}\nDate: ${date}\nTime: ${time}`,
      android: {
        channelId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
const Home = () => {
  const {token, credentials, loginType} = useAuth();

  const webViewRef = useRef(null);
  const {fetchData} = useAxios();
  const p = useBgFetch();
  console.log(p);

  const [webViewData, setWebViewData] = useState(null);
  const [webViewError, setWebViewError] = useState(null);

  const [referrerCode] = useState(47131415);
  const isFocused = useIsFocused();
  const {colors} = useTheme();
  const [pageUrl, setPageUrl] = useState('');
  const [showWebView, setShowWebView] = useState(true);
  const [ViewStyle, setViewStyle] = useState({});

  const checkPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      console.log(granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Alert.alert('Permission Granted', 'Notification will appear in 1 minute');
        // scheduleNotification(` New Rolled ${Date.now().toLocaleString()}` )
      } else {
        Alert.alert('Permission Denied', 'You will not receive notifications');
      }
    } catch (err) {
      console.warn('Permission error:', err);
    }
  };

  useEffect(() => {
    checkPermission();

    // Cleanup notification on component unmount
    return () => {
      notifee.cancelAllNotifications();
    };
  }, []);

  const refreshWebView = () => {
    if (webViewRef.current) {
      // Reload the WebView
      webViewRef.current.reload();

      // Delay inject to ensure DOM is available after reload
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectedJavaScript);
        console.log('Injected JS manually');
      }, 1000);
    }
  };

  useEffect(() => {
    refreshWebView();
  }, []);

  const rollWithoutCaptcha = () => {
    if (!webViewRef.current) return;

    // Click the "Play without Captcha" button
    const clickWithoutCaptchaJS = `
      const withoutCaptchaBtn = document.querySelector('#play_without_captchas_button');
      if (withoutCaptchaBtn) {
        withoutCaptchaBtn.click();
      }
      true;
    `;

    webViewRef.current.injectJavaScript(clickWithoutCaptchaJS);

    // After 500ms, click the roll button and refresh
    setTimeout(() => {
      const clickRollButtonJS = `
        const rollButton = document.querySelector('#free_play_form_button');
        if (rollButton && !rollButton.disabled) {
          rollButton.click();
        }
        true;
      `;

      webViewRef.current?.injectJavaScript(clickRollButtonJS);
      scheduleNotification(` New Rolled ${Date.now()}`);

      // Refresh the WebView after another short delay
      setTimeout(() => {
        refreshWebView();
      }, 1000);
    }, 500);
  };

  const _SignUp = () => {
    console.log(credentials);
    console.log({email: credentials?.email});
    console.log(loginType);

    if (loginType === 'login') {
      console.log(`inside login`);
      if (credentials?.email) {
        console.log('inside email');
        const loginFormValue = `
      (function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'SwitchTologin', 
          value: 'Button Clicked
        });
      })();
    `;
        webViewRef.current?.injectJavaScript(loginFormValue);
      }
    } else {
      // Handle signup form (original code)
      if (credentials?.email) {
        const signupFormValue = `
                (function() {
                    // Try to find and click the signup button to show signup form
                    const signupButton = document.querySelector('.signup_menu_button');
                    if (signupButton) {
                        signupButton.click();
                    }

                    const emailAddress = document.querySelector('#signup_form_email');
                    const password = document.querySelector('#signup_form_password');
                    const signUpButton = document.querySelector('#signup_button');
                    const referrerCode = document.querySelector('#referrer_in_form');

                    if (referrerCode && !referrerCode.value) {
                        referrerCode.value = '68945025';
                        referrerCode.disabled = true;
                    }

                    if (emailAddress && password) {
                        emailAddress.value = '${credentials.email}';
                        password.value = '${credentials.password}';
                    }
                })();
            `;
        webViewRef.current?.injectJavaScript(signupFormValue);
      }

      const injectCaptchaAndSubmit = `
            (function() {
                const signUpButton = document.querySelector('#signup_button');
                const captchaField = document.querySelector('[name="cf-turnstile-response"]');
                
                if (signUpButton) {
                    // signUpButton.click();   
                }
            })();
        `;

      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectCaptchaAndSubmit);
      }, 500);
    }

    setTimeout(() => {
      isFreebtcLoggedIn();
    }, 700);
  };

  const isFreebtcLoggedIn = () => {
    const rollFun = `
      (function() {
       const isRollButtonAvail = document.querySelector('#free_play_form_button');
           if (isRollButtonAvail) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'roll_Button', 
          avail: true 
        }));
     
        }
      })();
    `;
    webViewRef.current?.injectJavaScript(rollFun);
    isBalance();
  };

  const isBalance = () => {
    const isbalanceAvail = `  (function() {
     const balanceElement = document.querySelector('#balance');
          if(balanceElement){
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'balanceAvailable', 
          avail: true 
        }));
          }else{
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'balanceAvailable', 
          avail: true 
        }));
          }
        }
      })();`;

    webViewRef.current?.injectJavaScript(isbalanceAvail);
  };
  // not using much
  const rollAndCaptcha = () => {
    const clickRollButtonJS = `
    const rollButton = document.querySelector('#free_play_form_button');
    if (rollButton && !rollButton.disabled) {
      rollButton.click();
    }
    true;
  `;

    webViewRef.current?.injectJavaScript(clickRollButtonJS);
    scheduleNotification(` New Rolled ${Date.now()}`);
  };

  // main fucntions which handles rolling anc checking is captcha verified or not
  const _checkisCaptchaVerifiedAndRoll = () => {
    console.log('Checking CAPTCHA and roll...');

    // 1. First ensure the WebView has the ReactNativeWebView bridge set up
    const initScript = `
    window.ReactNativeWebView = window.ReactNativeWebView || {
      postMessage: function(data) {
        window.webkit?.messageHandlers?.ReactNativeWebView?.postMessage(data);
      }
    };
    true; // Important for injectJavaScript to work
  `;

    // 2. The actual CAPTCHA checking script
    const captchaCheckScript = `
    (function() {
      function checkIsCaptchaVerifiedAndRoll() {
        const captchaField = document.querySelector('[name="cf-turnstile-response"]');
        const rollButton = document.querySelector('#free_play_form_button');

        // If already verified and roll button exists
        if (captchaField?.value && rollButton) {
          rollButton.click();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'roll_triggered',
            status: 'immediate',
            message: 'Rolled immediately - CAPTCHA already verified'
          }));
          return;
        }

        // If not verified yet, set up observer
        if (captchaField) {
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && 
                  mutation.attributeName === 'value' && 
                  captchaField.value && 
                  rollButton) {
                rollButton.click();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'roll_triggered',
                  status: 'after_verification',
                  message: 'Rolled after CAPTCHA verification'
                }));
                observer.disconnect();
              }
            });
          });

          observer.observe(captchaField, {
            attributes: true,
            attributeFilter: ['value']
          });

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'observer_setup',
            message: 'Waiting for CAPTCHA verification'
          }));
          return;
        }

        if(!rollButton){
         window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: 'Roll Button Not Found'
        }));
        }else{

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: 'CAPTCHA field not found',
          value:rollButton
        }));
        }
       
        
        
      }

      // Execute the function
      checkIsCaptchaVerifiedAndRoll();
    })();
    true; // Important to return true
  `;

    // 3. First inject the initialization script
    webViewRef.current?.injectJavaScript(initScript);

    // 4. Then inject the CAPTCHA check script after a small delay
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(captchaCheckScript);
    }, 300);
  };

  const directlogin = () => {
    if (loginType === 'login' && credentials?.email) {
      console.log('Attempting direct login with:', credentials);

      // First, click the login button to show the form
      const clickLoginButtonJS = `
      (function() {
        const loginButton = document.querySelector('.login_menu_button');
        if (loginButton) {
          loginButton.click();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'login_button_clicked',
            success: true
          }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'login_button_clicked',
            success: false,
            error: 'Login button not found'
          }));
        }
        true;
      })();
    `;

      webViewRef.current?.injectJavaScript(clickLoginButtonJS);

      // Then after a delay, fill the form
      setTimeout(() => {
        const fillFormJS = `
        (function() {
          // Use the correct selectors for LOGIN form (not signup)
          const emailField = document.querySelector('#login_form_btc_address');
          const passwordField = document.querySelector('#login_form_password');
          const fa2Field = document.querySelector('#login_form_2fa');
          
          if (emailField) {
            emailField.value = '${credentials.email}';
            console.log('Email field filled');
          } else {
            console.log('Email field not found');
          }
          
          if (passwordField) {
            passwordField.value = '${credentials.password}';
            console.log('Password field filled');
          } else {
            console.log('Password field not found');
          }
          
          if (fa2Field && '${credentials.FA2}') {
            fa2Field.value = '${credentials.FA2}';
            console.log('2FA field filled');
          }
          
          // Submit the form after filling
          const loginSubmitButton = document.querySelector('#login_button');
          if (loginSubmitButton) {
            setTimeout(() => {
              loginSubmitButton.click();
              console.log('Login form submitted');
            }, 500);
          }
          
          true;
        })();
      `;

        webViewRef.current?.injectJavaScript(fillFormJS);
      }, 1000); // Increased delay to ensure form is visible
      setTimeout(() => {
        isFreebtcLoggedIn();
      }, 1300);
    }
  };
  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(data);
      switch (data.type) {
        case 'page_data':
          setWebViewData(data);
          if (data.balance) {
            setViewStyle({
              dashboard: {
                position: 'relative',
              },
              webView: {
                position: 'absolute',
              },
            });
          }

          break;
        case 'extraction_error':
          setWebViewError(data.error);
          break;

        case 'Play_withoutCaptcha':
          // rollWithoutCaptcha();
          break;

        case 'form_values':
          directlogin();
          break;

        case 'Captcha&form':
          console.log('Captcha&form');
          _SignUp();

          break;

        case 'rollButton&captcha':
          rollAndCaptcha();
          break;

        case 'roll_Button':
          _checkisCaptchaVerifiedAndRoll();
          // setShowWebView(false);

          break;

        case 'loginMenuButton':
          console.log('login Button', data);

          break;
        case 'SwitchTologin':
          console.log('SwitchTologin', data);

          break;
        case 'roll_triggered':
          webViewRef.current?.injectJavaScript(injectedJavaScript);
          setTimeout(() => {
            refreshWebView();
          }, 1000);

          // setShowWebView(false);

          break;

        case 'PAGE_URL':
          setPageUrl(data.url);
          break;

        case 'error':
          console.log(data);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
      setWebViewError(error);
    }
  };

  const injectedJavaScript = `
    (function() {
        let dataExtracted = false;
        let retryCount = 0;
        const MAX_RETRIES = 2;
        const currentUrl = window.location.href;

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_URL', url: currentUrl }));

      function extractTimer() {
        try {
          const timerElement = document.getElementById('time_remaining');
          if (!timerElement) return null;

          const amountElements = timerElement.querySelectorAll('.countdown_amount');
          const minutesElement = amountElements[0];
          const secondsElement = amountElements[1];

          return {
            minutes: minutesElement ? minutesElement.textContent.trim() : '00',
            seconds: secondsElement ? secondsElement.textContent.trim() : '00'
          };
        } catch (error) {
          console.error('Timer extraction error:', error);
          return { minutes: '00', seconds: '00' };
        }
      }

  function setupFreePlayButtonObserver() {
    const freePlayButton = document.querySelector('#free_play_form_button');
    
    if (freePlayButton) {
      const initialDisplay = window.getComputedStyle(freePlayButton).display;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'freePlayButtonDisplayChange',
        isVisible: initialDisplay === 'inline-block',
        displayValue: initialDisplay,
        message: 'Initial free play button state captured'
      }));

      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            const currentDisplay = window.getComputedStyle(freePlayButton).display;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'freePlayButtonDisplayChange',
              isVisible: currentDisplay === 'inline-block',
              displayValue: currentDisplay,
              message: 'Free play button display changed'
            }));

            const canRoll = !freePlayButton.disabled;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'freePlayButtonAvailability',
              canRoll: canRoll,
              message: canRoll ? 'Button is enabled' : 'Button is disabled'
            }));
          }
        });
      });

      observer.observe(freePlayButton, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      return true;
    }
    return false;
  }

  function monitorCaptcha() {
    const captchaField = document.querySelector('[name="cf-turnstile-response"]');
    const signUpButton = document.querySelector('#signup_button');
    let lastCaptchaValue = '';

    if (captchaField) {
      if (captchaField.value && captchaField.value !== lastCaptchaValue) {
        lastCaptchaValue = captchaField.value;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'captchaValue',
          value: captchaField.value,
          message: 'Initial captcha value found'
        }));
      }

      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            if (captchaField.value !== lastCaptchaValue) {
              lastCaptchaValue = captchaField.value;

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'captchaValue',
                value: captchaField.value,
                message: 'Captcha value changed'
              }));

              if (signUpButton) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'Captcha&form',
                  value: captchaField.value,
                  message: 'Captcha value changed with signup button present'
                }));
              }
            }
          }
        });
      });

      observer.observe(captchaField, {
        attributes: true,
        attributeFilter: ['value']
      });

      return true;
    }
    return false;
  }

  function extractDataOnce() {
    if (dataExtracted || retryCount >= MAX_RETRIES) return;

    try {
      const balanceElement = document.querySelector('#balance');
      const balance = balanceElement ? balanceElement.innerText : null;
      const isplay_without_captchas_button = document.querySelector('#play_without_captchas_button');

      if (isplay_without_captchas_button) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'Play_withoutCaptcha',
          available: true,
          message: 'Play without captchas button found'
        }));
      }

      const rollButton = document.querySelector('#free_play_form_button');
      const canRoll = !!rollButton && !rollButton.disabled;

      const timer = extractTimer();

      const captchaFound = monitorCaptcha();
      const freePlayObserverSetUp = setupFreePlayButtonObserver();

      if (balance !== null || timer !== null || freePlayObserverSetUp) {
        dataExtracted = true;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'page_data',
          balance: balance,
          canRoll: canRoll,
          timer: timer,
          timestamp: new Date().toISOString(),
          captchaAvailable: captchaFound,
          freePlayObserverSetUp: freePlayObserverSetUp,
          message: 'Initial page data extracted'
        }));
      } else {
        throw new Error('Elements not found');
      }
    } catch (error) {
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        setTimeout(extractDataOnce, 1000);
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'extraction_error',
          error: 'Max retries reached. Elements not found.',
          message: 'Failed to extract data after maximum retries'
        }));
      }
    }
  }

  let signupRetryCount = 0;
  const SIGNUP_MAX_RETRIES = 5;

  function tryInjectSignup() {
    if (signupRetryCount >= SIGNUP_MAX_RETRIES) return;

    const signupForm = document.querySelector('#signup_form_div');
    const isRollButtonAvail = document.querySelector('#free_play_form_button');
    const captchaField = document.querySelector('[name="cf-turnstile-response"]');
    
    if (isRollButtonAvail) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ 
        type: 'roll_Button', 
        avail: true,
        message: 'Roll button is available' 
      }));
    }

    if (isRollButtonAvail && captchaField && captchaField.value) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ 
        type: 'rollButton&captcha', 
        avail: true,
        message: 'Roll button and captcha are both available' 
      }));
    }

    if (signupForm) {
      const emailAddress = document.querySelector('#signup_form_email');
      const password = document.querySelector('#signup_form_password');
      const signUpButton = document.querySelector('#signup_button');
      const referrerCode = document.querySelector('#referrer_in_form');
      const captchaField = document.querySelector('[name="cf-turnstile-response"]');

      function sendFormValues() {
        const message = {
          type: 'form_values',
          email: emailAddress?.value || '',
          password: password?.value || '',
          referrerCode: referrerCode?.value || '',
          message: 'Current form values'
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }

      sendFormValues();

      if (signUpButton) {
        signUpButton.addEventListener('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'button_clicked',
            message: 'Signup button clicked'
          }));
        });
      }

      if (signUpButton && captchaField && captchaField.value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'signup_ready',
          message: 'Signup button and captcha are both available'
        }));
      }
    } else {
      signupRetryCount++;
      setTimeout(tryInjectSignup, 1000);
    }
  }

  // Initial execution
  extractDataOnce();
  tryInjectSignup();

  true;
})();
`;

  const handleWebViewLoad = () => {
    // WebView loaded handler if needed
  };

  return (
    <>
      {token ? (
        <>
          <View
            style={[
              {
                position: 'absolute',
              },
              ViewStyle?.dashboard,
            ]}>
            <DashBoard webViewData={webViewData} />
          </View>

          <View style={[styles.hiddenWebViewContainer, ViewStyle?.webView]}>
            <WebView
              ref={webViewRef}
              source={{uri: 'https://freebitco.in/'}}
              injectedJavaScript={injectedJavaScript}
              onMessage={onMessage}
              onLoadEnd={handleWebViewLoad}
              style={styles.hiddenWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              // renderLoading={() => (
              //   <View style={styles.loadingContainer}>
              //     <ActivityIndicator size="large" color="#6200ee" />
              //   </View>
              // )}
              // userAgent=" /5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              mixedContentMode="always"
            />
          </View>
        </>
      ) : (
        <LoginForm onSubmit={() => {}} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  hiddenWebViewContainer: {
    flex: 1,
    marginTop: hp(5),
    // position: 'absolute',
    zIndex: 2,
  },
});

export default Home;

// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import BgFetchScreen from '../components/BgFetchScreen'

// export default function Home() {
//   return (

//     <BgFetchScreen/>

//   )
// }

// const styles = StyleSheet.create({})
