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
import {useIsFocused} from '@react-navigation/native';
import notifee from '@notifee/react-native';
import useTheme from '../hooks/useTheme';
import useBgFetch from '../hooks/useBgfetch';
import {useWebView} from '../context/WebviewContext';
import CookieManager from '@react-native-cookies/cookies';
import {showNotification} from '../utils/Notify';
import Toast from 'react-native-toast-message';

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
  const {token, credentials, loginType, logout,btBalance,userDetails, setBTbalance} = useAuth();

  const webViewRef = useRef(null);
  const {fetchData} = useAxios();
  const {shouldLogout, clearLogoutFlag} = useWebView();
  // const p = useBgFetch();

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
    const clearEverything = async () => {
      CookieManager.clearAll();

      // 2. Inject JS to clear localStorage, sessionStorage, and visible cookies
      const clearScript = `
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        });
        true;
      `;

      // 3. Inject JS and clear WebView cache & data
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(clearScript);

        webViewRef.current.clearCache(true);
        webViewRef.current.clearFormData();
        webViewRef.current.clearHistory();
        webViewRef.current.reload();
      }

      clearLogoutFlag(); // Reset the flag so it doesn't run again
    };

    if (shouldLogout) {
      clearEverything();
      logout();
    }
  }, [shouldLogout]);

  useEffect(() => {
    checkPermission();

    // Cleanup notification on component unmount
    return () => {
      notifee.cancelAllNotifications();
    };
  }, []);
  const LevelSatoshiDistribute = async () => {
    try {
      const res = await fetchData({
        url: `user/income/distributeincomtoreferrer/${userDetails?.id}`,
        method: ' ',
        data: {},
      });
      
        
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const SaveRollhistotyinDb = async (btc: any) => {
    try {
      const res = await fetchData({
        url: `/user/roll/new`,
        method: 'POST',
        data: {
          btc: btc,
        },
      });
      
      LevelSatoshiDistribute()
        refreshWebView()
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  

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

  const handleWebViewLoad = () => {
    // WebView loaded handler if needed
  };

  const injectedJavaScript = `
(function () {
  // Check for signup or login form
  const isSignUpOrLoginForm = document.querySelector('#signup_form_div');
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: isSignUpOrLoginForm ? 'signupFormAvail' : 'signupFormNotAvail',
    message: isSignUpOrLoginForm ? 'Signup or LoginForm' : 'Signup not LoginForm'
  }));

  // ========== ENHANCED MODAL OBSERVER ========== //
  function setupModalObserver() {
    const modal = document.getElementById('myModal22');
    if (!modal) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODAL_NOT_FOUND',
        message: 'Modal not found in DOM'
      }));
      return;
    }

    // Function to check for close button and report modal state
    function reportModalState() {
      const styles = window.getComputedStyle(modal);
      const closeButton = modal.querySelector('.close-reveal-modal');
      
      const report = {
        type: 'MODAL_STATE_UPDATE',
        display: styles.display,
        visibility: styles.visibility,
        hasOpenClass: modal.classList.contains('open'),
        hasCloseButton: !!closeButton,
        closeButtonHtml: closeButton ? closeButton.outerHTML : null,
        // modalHtml: modal.outerHTML,
        message: 'Current modal state'
      };

      window.ReactNativeWebView.postMessage(JSON.stringify(report));

      // If modal is visible and has close button, attempt to close it
      if (styles.display === 'block' && 
          styles.visibility === 'visible' &&
          closeButton) {
        closeButton.click();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MODAL_CLOSE_ATTEMPTED',
          message: 'Attempted to close modal via click'
        }));
      }
    }

    // Initial report
    reportModalState();

    // Set up observer for modal and its contents
    const observer = new MutationObserver(function(mutations) {
      let shouldReport = false;
      
      mutations.forEach(function(mutation) {
        // Check for attribute changes on modal
        if (mutation.target === modal && 
            mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          shouldReport = true;
        }
        
        // Check for added/removed close button
        if (mutation.type === 'childList') {
          const addedCloseButton = Array.from(mutation.addedNodes).some(node => 
            node.classList && node.classList.contains('close-reveal-modal'));
          
          const removedCloseButton = Array.from(mutation.removedNodes).some(node => 
            node.classList && node.classList.contains('close-reveal-modal'));
            
          if (addedCloseButton || removedCloseButton) {
            shouldReport = true;
          }
        }
      });

      if (shouldReport) {
        reportModalState();
      }
    });

    // Observe modal and its subtree for changes
    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'MODAL_OBSERVER_ACTIVE',
      message: 'Now watching modal and close button'
    }));
  }

  // Start observing modal (if exists)
  setupModalObserver();
  // ========== END ENHANCED CODE ========== //

  // [Rest of your existing timer and button observation code...]
  // Timer extraction helper
  function extractAndPostTimer() {
    const timerElement = document.getElementById('time_remaining');
    const balanceElement = document.querySelector('#balance');
    if (!timerElement) return;

    const amountElements = timerElement.querySelectorAll('.countdown_amount');
    const minutes = amountElements[0]?.textContent.trim() || '00';
    const seconds = amountElements[1]?.textContent.trim() || '00';

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'TIMER_INITIAL',
      minutes: minutes,
      seconds: seconds,
      balance: balanceElement ? balanceElement.innerText : null,
      message: 'Timer initially detected'
    }));
  }

  // Observe DOM for when #time_remaining becomes available
  const observeTimerContainer = new MutationObserver(() => {
    const timerContainer = document.getElementById('time_remaining');
    if (timerContainer) {
      extractAndPostTimer();
      observeTimerContainer.disconnect();
    }
  });

  observeTimerContainer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (document.getElementById('time_remaining')) {
    extractAndPostTimer();
    observeTimerContainer.disconnect();
  }

  // Button observer
  const observeButton = new MutationObserver(() => {
    const button = document.querySelector('#free_play_form_button');
    if (button) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'BUTTON_AVAILABLE',
        message: 'Button detected in DOM'
      }));
      observeButton.disconnect();
    }
  });

  observeButton.observe(document.body, {
    childList: true,
    subtree: true
  });

  const existingButton = document.querySelector('#free_play_form_button');
  if (existingButton) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'BUTTON_AVAILABLE',
      message: 'Button already exists'
    }));
    observeButton.disconnect();
  }

  return true;
})();
`;

  const loginandSignUp = () => {
    console.log(loginType);
    if (loginType === 'login') {
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
           if(${credentials?.FA2}){
             if (fa2Field && '${credentials.FA2}') {
            fa2Field.value = '${credentials.FA2}';
            console.log('2FA field filled');
          }
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
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(fillFormJS);
      }, 1000);
    }
    if (loginType === 'signUp') {
      console.log('Starting sign-up process');

      // First, fill the form fields
      const fillForm = `
    (function() {
      const emailAddress = document.querySelector('#signup_form_email');
      const password = document.querySelector('#signup_form_password');
      const referrerCode = document.querySelector('#referrer_in_form');

      if (referrerCode && !referrerCode.value) {
        referrerCode.value = '68945025';
        referrerCode.disabled = true;
      }

      if (emailAddress && password) {
        emailAddress.value = '${credentials.email}';
        password.value = '${credentials.password}';
      }
      return true;
    })();
  `;
      webViewRef.current?.injectJavaScript(fillForm);

      // Then set up captcha observation and auto-submit
      const captchaObserver = `
    (function() {
      // Elements we need
      const signUpButton = document.querySelector('#signup_button');
      const captchaField = document.querySelector('[name="cf-turnstile-response"]');
      
      if (!captchaField) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'TURNSTILE_ERROR',
          message: 'Captcha field not found'
        }));
        return true;
      }

      if (!signUpButton) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SIGNUP_ERROR',
          message: 'Signup button not found'
        }));
        return true;
      }

      // Observer for captcha changes
      const observer = new MutationObserver(function() {
        if (captchaField.value) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'TURNSTILE_VERIFIED',
            message: 'Captcha verified, submitting form'
          }));
          
          // Add slight delay to ensure everything is ready
          setTimeout(() => {
            signUpButton.click();
          }, 500);
          
          // Clean up observer after submission
          observer.disconnect();
        }
      });

      // Start observing
      observer.observe(captchaField, {
        attributes: true,
        attributeFilter: ['value'],
        childList: false,
        subtree: false
      });

      // Check immediately in case captcha is already verified
      if (captchaField.value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'TURNSTILE_VERIFIED',
          message: 'Captcha already verified, submitting form'
        }));
        setTimeout(() => {
          signUpButton.click();
        }, 500);
        observer.disconnect();
      }

      return true;
    })();
  `;

      webViewRef.current?.injectJavaScript(captchaObserver);
    }
  };

 const rollwithButton = () => {
    const script = `
    (function() {
      const captchaField = document.querySelector('[name="cf-turnstile-response"]');
      const rollButton = document.querySelector('#free_play_form_button');

      if (!captchaField) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CAPTCHA_NOT_FOUND',
          message: 'Captcha field not found'
        }));
        return false;
      }

      let lastCaptchaValue = captchaField.value || '';

      // Function to try clicking the roll button
      function tryClickRollButton() {
        const button = document.querySelector('#free_play_form_button');
        if (button && !button.disabled) {
          button.click();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ROLL_CLICKED',
            message: 'Roll button clicked after captcha filled'
          }));


          //  check the winning results
              setTimeout(() => {
                // ROLL RESULT CHECK (safe)
                      const resultContainer = document.getElementById('free_play_result');

                      if (resultContainer) {
                        const btc = document.querySelector('#winnings')?.textContent.trim() || '';
                        const tickets = document.querySelector('#fp_lottery_tickets_won')?.textContent.trim() || '0';
                        const rewards = document.querySelector('#fp_reward_points_won')?.textContent.trim() || '0';

                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'ROLL_RESULT',
                          btc,
                          tickets,
                          rewards,
                          message: 'Roll result found without observer'
                        }));
                      } else {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'ROLL_RESULT_NOTFOUND',
                          message: 'Roll result not yet available'
                        }));
                      }
          }, 1200);

        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ROLL_NOT_READY',
            message: 'Roll button not found or disabled'
          }));
        }
      }

      // Initial check
      if (lastCaptchaValue) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CAPTCHA_INITIAL_VALUE',
          value: lastCaptchaValue,
          message: 'Captcha initially present'
        }));
        tryClickRollButton();
      }

      // Observer for captcha value changes
      const observer = new MutationObserver(() => {
        const newValue = captchaField.value;
        if (newValue && newValue !== lastCaptchaValue) {
          lastCaptchaValue = newValue;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CAPTCHA_UPDATED',
            value: newValue,
            message: 'Captcha value changed'
          }));
          tryClickRollButton();
        }
      });

      observer.observe(captchaField, {
        attributes: true,
        attributeFilter: ['value']
      });

      // Optional cleanup
      window._captchaObserverCleanup = function() {
        observer.disconnect();
      };

      return true;
    })();
  `;

    webViewRef.current?.injectJavaScript(script);
  };

  const onMessages = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // setBTbalance(data)
    const type = data?.type;
    console.log(type);
    switch (type) {
      case 'signupFormAvail':
        loginandSignUp();
        break;

      case 'TURNSTILE_TOKEN':
        showNotification('Captcha Verified', 'success');
        console.log(data);
        break;

      case 'BUTTON_AVAILABLE':
        rollwithButton();
        break;

      case 'TIMER_INITIAL':
        console.log(data);
        setBTbalance(data)
        break;

      case 'ROLL_RESULT':
        if (data.btc) {
          console.log(data.btc)
          SaveRollhistotyinDb(data.btc);
        }
        break;

      case 'MODAL_STATE_UPDATE':
        console.log(data);
        if (
          data.display !== 'none' ||
          data.visibility !== 'hidden' ||
          data.hasOpenClass
        ) {
          hideModalIfOpen(); // Only hide if modal is open
        }
        break;
    }
  };

const hideModalIfOpen = () => {
  const hideScript = `
  (function() {
    const modal = document.querySelector('#myModal22');
    if (!modal) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODAL_HIDE_FAILED',
        message: 'Modal element not found'
      }));
      return true;
    }

    // Check if modal is currently open/visible
    const styles = window.getComputedStyle(modal);
    const isVisible = styles.display !== 'none' && 
                     styles.visibility !== 'hidden' &&
                     (modal.classList.contains('open') || 
                      styles.opacity > 0);
    
    if (isVisible) {
      // Force hide the modal with important flags
      const closeButton = modal.querySelector('.close-reveal-modal');
       if(closeButton) {
       closeButton.click();
       
       }

      modal.classList.remove('open', 'active', 'show');
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODAL_HIDE_SUCCESS',
        message: 'Force-closed open modal',
        previousState: {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          hadOpenClass: modal.classList.contains('open')
        }
      }));
    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODAL_ALREADY_HIDDEN',
        message: 'Modal was already hidden',
        currentState: {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          hasOpenClass: modal.classList.contains('open')
        }
      }));
    }
    true;
  })();
  `;
  
  webViewRef.current?.injectJavaScript(hideScript);
};

  return (
    <>
      <Toast position="top" swipeable topOffset={100} />
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
              onMessage={onMessages}
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
