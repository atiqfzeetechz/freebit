import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Alert,
  StatusBar,
  Text,
} from 'react-native';

import { WebView } from 'react-native-webview';
import { hp } from '../helper/hpwp';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import DashBoard from '../components/DashBoard';
import useAxios from '../hooks/useAxios';
import { useIsFocused } from '@react-navigation/native';
// import notifee from '@notifee/react-native';
import useTheme from '../hooks/useTheme';
import useBgFetch from '../hooks/useBgfetch';
import { useWebView } from '../context/WebviewContext';
import CookieManager from '@react-native-cookies/cookies';
import { showNotification } from '../utils/Notify';
import Toast from 'react-native-toast-message';
import { useData } from '../hooks/useGlobalData';
import { startForegroundService } from '../helper/service';
import { setWebViewRef } from '../utils/globalWebViewRef';
import { ActivityIndicator } from 'react-native-paper';
import FixNowModal from '../helper/FixNowModal';

const formatDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    fullDateTime: now.toLocaleString(),
  };
};

export const scheduleNotification = async (message = 'Hii') => {};

const IS_DISABLED = false;
const Home = () => {
  const {
    token,
    credentials,
    loginType,
    logout,
    btBalance,
    userDetails,
    setBTbalance,
    setuserDetails,
    referalId,
    setReferalId,
  } = useAuth();

  const { stats, setStats } = useData();
  const webViewRef = useRef(null);
  const { fetchData } = useAxios();
  const {
    shouldLogout,
    clearLogoutFlag,
    SyncWebViewClick,
    setSyncWebViewclick,
  } = useWebView();
  console.log(userDetails);
  // const p = useBgFetch();
  console.log(stats);

  const [webViewData, setWebViewData] = useState(null); //make this state to gloable
  const [webViewError, setWebViewError] = useState(null);

  const [referrerCode] = useState(47131415);
  const isFocused = useIsFocused();
  const { colors } = useTheme();
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
        // Alert.alert('Permission Denied', 'You will not receive notifications');
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
    startForegroundService();

    // Cleanup notification on component unmount
  }, []);

  useEffect(() => {
    const isAdminCheck = async () => {
      const res = await fetchData({
        url: '/user/auth/isAdmin',
      });
      if (res?.data.success) {
        setuserDetails(pre => ({ ...pre, isAdmin: true }));
      }
      console.log(res);
    };
    isAdminCheck();
  }, []);
  const LevelSatoshiDistribute = async () => {
    try {
      const res = await fetchData({
        url: `user/income/distributeincomtoreferrer/${userDetails?.id}`,
        method: 'POST',
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

      // LevelSatoshiDistribute();
      // refreshWebView();
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
      // setTimeout(() => {
      //   webViewRef.current?.injectJavaScript(injectedJavaScript);
      //   // webViewRef.current?.stopLoading();
      //   console.log(webViewRef);
      //   console.log('Injected JS manually');
      // }, 1000);
    }
  };

  const memoizedFn = useCallback(() => {
    console.log('Function logic runs');
    // your original SyncWebViewClick logic here
    refreshWebView();
  }, []); // add dependencies here if needed

  useEffect(() => {
    console.log('call useEffect bar bar bar bar bar abr ');
    // refreshWebView();
    memoizedFn();
  }, [memoizedFn]);

  const handleWebViewLoad = () => {
    console.log('fully loaded');

    // WebView loaded handler if console.log("WebView Loaded, injecting JS...");
    webViewRef.current?.injectJavaScript(injectedJavaScript);
    setWebViewRef(webViewRef);
  };

  const injectedJavaScript = `
(function () {
  // ================ Check for signup or login form =======================
  const isSignUpOrLoginForm = document.querySelector('#signup_form_div');

  if (isSignUpOrLoginForm) {
    // Hide form visually but keep in DOM
    isSignUpOrLoginForm.style.setProperty('position', 'relative', 'important');

    // Check if overlay already exists
    if (!document.getElementById('signup_overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'signup_overlay';
      overlay.innerHTML = \`
        <div style="
          position: absolute;
          inset: 0;
          background: #342015;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border-radius: 8px;
          text-align: center;
          padding: 20px;
          z-index: 9999;
        ">
          🚀  Syncing Data, Please wait...
        </div>
      \`;
      isSignUpOrLoginForm.appendChild(overlay);
    }
  }

  // Hide homepage login/signup buttons
  const homepageLoginBtn = document.querySelector('#homepage_login_button');
  if (homepageLoginBtn) homepageLoginBtn.style.setProperty('visibility', 'hidden', 'important');

  const homepageSignupBtn = document.querySelector('#homepage_signup_button');
  if (homepageSignupBtn) homepageSignupBtn.style.setProperty('visibility', 'hidden', 'important');

  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: isSignUpOrLoginForm ? 'signupFormAvail' : 'signupFormNotAvail',
    message: isSignUpOrLoginForm ? 'Signup or LoginForm' : 'Signup not LoginForm'
  }));

  // ================= MODAL OBSERVER ===================
  function setupModalObserver() {
    const modal = document.getElementById('myModal22');
    if (!modal) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MODAL_NOT_FOUND', message: 'Modal not found in DOM' }));
      return;
    }

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
        message: 'Current modal state'
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(report));

      if (styles.display === 'block' && styles.visibility === 'visible' && closeButton) {
        closeButton.click();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MODAL_CLOSE_ATTEMPTED', message: 'Attempted to close modal via click' }));
      }
    }

    reportModalState();

    const observer = new MutationObserver((mutations) => {
      let shouldReport = false;
      mutations.forEach((mutation) => {
        if (mutation.target === modal && mutation.type === 'attributes' && ['style','class'].includes(mutation.attributeName)) shouldReport = true;
        if (mutation.type === 'childList') {
          const addedClose = Array.from(mutation.addedNodes).some(node => node.classList?.contains('close-reveal-modal'));
          const removedClose = Array.from(mutation.removedNodes).some(node => node.classList?.contains('close-reveal-modal'));
          if (addedClose || removedClose) shouldReport = true;
        }
      });
      if (shouldReport) reportModalState();
    });

    observer.observe(modal, { attributes:true, attributeFilter:['style','class'], childList:true, subtree:true });
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MODAL_OBSERVER_ACTIVE', message: 'Now watching modal and close button' }));
  }

  setupModalObserver();

  // ================= TIMER & BUTTON OBSERVERS ===================
  function extractAndPostTimer() {
    const timerEl = document.getElementById('time_remaining');
    const balanceEl = document.querySelector('#balance');
    if (!timerEl) return;
    const amounts = timerEl.querySelectorAll('.countdown_amount');
    const minutes = amounts[0]?.textContent.trim() || '00';
    const seconds = amounts[1]?.textContent.trim() || '00';
    window.ReactNativeWebView.postMessage(JSON.stringify({ type:'TIMER_INITIAL', minutes, seconds, balance: balanceEl?.innerText, message:'Timer initially detected' }));
  }

  const timerObserver = new MutationObserver(() => {
    const timerContainer = document.getElementById('time_remaining');
    if (timerContainer) { extractAndPostTimer(); timerObserver.disconnect(); }
  });
  timerObserver.observe(document.body,{ childList:true, subtree:true });
  if (document.getElementById('time_remaining')) { extractAndPostTimer(); timerObserver.disconnect(); }

  const buttonObserver = new MutationObserver(() => {
    const buttons = document.querySelectorAll('#free_play_form_button');
    const visibleButton = Array.from(buttons).find(b=>b.style.display!=='none');
    if (visibleButton) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'BUTTON_AVAILABLE', message:'Visible button detected'})); buttonObserver.disconnect(); }
  });
  buttonObserver.observe(document.body,{ childList:true, subtree:true });

})();
`;

  const saveFreebtcReferCode = async (code: any) => {
    try {
      const res = await fetchData({
        url: '/user/auth/addFreebtcReferCode',
        method: 'PATCH',
        data: {
          ourCode: code,
        },
      });
      const referCode = res?.data.data.freebtcReferCode;
      const isAdmin = res?.data.data.isAdmin;

      setuserDetails(prev => ({
        ...prev,
        freebtcReferCode: referCode,
        isAdmin: isAdmin,
      }));

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const disableLottery = () => {
    console.log('disableLottery called');
    const disableLotteryFn = `
    (function() {
      const checkbox = document.querySelector('#disable_lottery_checkbox');
      
      if (!checkbox) {
       window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOTTERY_CHECK_BOX',
          message: 'Checkbox not found',
          success: false
      
        }));
      
        return;
      }
      if (!checkbox.checked) {
        checkbox.click();
      }
         window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOTTERY_CHECK_BOX',
          message: 'Lottery Disabled',
          success: true,
          value: checkbox.checked 
      
        }));
     
    })();
  `;

    webViewRef.current?.injectJavaScript(disableLotteryFn);
  };

  const codeupdate = async (code: string | undefined) => {
    try {
      const res = await fetchData({
        url: '/user/auth/codeupdate',
        method: 'PATCH',
        data: {
          codeUsed: code,
        },
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  const loginandSignUp = () => {
    console.log(loginType);
    if (loginType === 'login') {
      // First, click the login button to show the form
      const clickLoginButtonJS = `
      (function() {
        const loginButton = document.querySelector('.login_menu_button');
        const loginForm = document.querySelector('#login_form_div');
        const signup_overlay = document.querySelector('#signup_overlay');
        if(signup_overlay){
        signup_overlay.style.setProperty('display', 'none', 'important');
        }

        // if (loginForm) {
        //   // Hide the form visually
        //   loginForm.style.setProperty('position', 'relative', 'important');

        //   // Only add overlay if not already added
        //   if (!document.getElementById('login_overlay')) {
        //     const overlay = document.createElement('div');
        //     overlay.id = 'login_overlay';
        //     overlay.innerHTML = \`
        //       <div style="
        //         position: absolute;
        //         inset: 0;
        //         background: #342015;
        //         color: white;
        //         display: flex;
        //         align-items: center;
        //         justify-content: center;
        //         font-size: 18px;
        //         border-radius: 8px;
        //         text-align: center;
        //         padding: r;
        //         z-index: 9999;
        //         top:-20px;
        //       ">
        //         🚀 Welcome! to FreeBTC.
        //         please wait Data is Syncing...
        //       </div>
        //     \`;
        //     loginForm.appendChild(overlay);
        //   }
        // }

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
        referrerCode.value = ${userDetails?.globalcodeused};
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
      let lastCaptchaValue = captchaField.value || '';

      // Function to try clicking the roll button
      function tryClickRollButton() {
        const button = document.querySelector('#free_play_form_button');
         const styles = window.getComputedStyle(button);
        if (button && !button.disabled && styles.display!== "none") {
          button.click();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ROLL_CLICKED',
            message: 'Roll button clicked after captcha filled',
            value:styles.display
          }));
       
          setTimeout(()=>{
             extractAndPostTimer()
             },1000)


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
        // tryClickRollButton();
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

  const getMyRewardPoints = () => {
    const getRewardsData = `
    (function() {
      const rewardPointsElement = document.querySelector('.user_reward_points');
      const myLotteryTickets = document.querySelector('#user_lottery_tickets');

      const data = {};
      if (rewardPointsElement) {
        data.points = rewardPointsElement.textContent.trim();
      }
      if (myLotteryTickets) {
        data.tickets = myLotteryTickets.textContent.trim();
      }

      if (data.points || data.tickets) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REWARD_POINTS',
          message: 'Fetched available data.',
          value: data
        }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          message: 'No data found.'
        }));
      }
    })();
  `;

    webViewRef.current?.injectJavaScript(getRewardsData);
  };

  const is2FAEnabled = () => {
    const script = `
    (function() {
      function isVisible(el) {
        if (!el) return false;

        // Check visibility up the DOM tree
        while (el) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
          }
          el = el.parentElement;
        }

        return true;
      }

      const messageText = 'Please enter the code generated by your 2 factor authentication app and click the button below to disable 2 factor authentication.';

      const p = Array.from(document.querySelectorAll('p')).find(p =>
        p.textContent.trim().replace(/\\s+/g, ' ') === messageText
      );

      let status = 'UNKNOWN';
      let parentStyles = null;

      if (p && p.parentElement) {
        const parent = p.parentElement;
        const style = window.getComputedStyle(parent);

        parentStyles = {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
        };

        const parentVisible = isVisible(parent);
        status = parentVisible ? 'ENABLED' : 'DISABLED';
      } else {
        status = 'NOT_FOUND';
      }

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: '2FA_STATUS_CHECK',
        content: {
          status,
          parentStyles,
        }
      }));
    })();
  `;

    webViewRef.current?.injectJavaScript(script);
  };

  const getwithdrawalAddress = () => {
    console.log('Attempting to get withdrawal address...');

    const addFunctionalities = `
    (function() {
      try {
        const addressInput = document.querySelector("#edit_profile_form_btc_address");
        
        if (addressInput && addressInput.value) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'WITHDRAWAL_ADDRESS',
            message: 'Withdrawal address found',
            value: addressInput.value,
            success: true
          }));
        } else {
          // Check if element exists but has no value
          if (addressInput) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'WITHDRAWAL_ADDRESS',
              message: 'Withdrawal address field exists but is empty',
              value: null,
              success: false
            }));
          } else {
            // Try alternative selectors if primary fails
            const altAddressInput = document.querySelector("input[name='btc_address'], [data-address='btc']");
            if (altAddressInput && altAddressInput.value) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'WITHDRAWAL_ADDRESS',
                message: 'Withdrawal address found using alternative selector',
                value: altAddressInput.value,
                success: true
              }));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'WITHDRAWAL_ADDRESS',
                message: 'No withdrawal address input field found',
                value: null,
                success: false
              }));
            }
          }
        }
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WITHDRAWAL_ADDRESS_ERROR',
          message: 'Error while fetching address: ' + error.message,
          value: null,
          success: false
        }));
      }
    })();
  `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(addFunctionalities);
    } else {
      console.error('WebView reference is not available');
      // You might want to handle this case in your UI
    }
  };

  const addAddress = async (address: string | null | undefined) => {
    if (userDetails?.addressAdded) {
      return;
    }
    try {
      const res = await fetchData({
        url: '/user/auth/addWithdrawalAddress',
        method: 'PATCH',
        data: {
          withdrawalAddress: address,
        },
      });
      setuserDetails((pre: any) => ({
        ...pre,
        addressAdded: res?.data.data.addressAdded,
        withdrawalAddress: res?.data.data.withdrawalAddress,
      }));
      // console.log(res?.data.data)
    } catch (error) {
      console.log(error);
    }
  };

  const [isProfileLinkClicked, setProfileLinkClicked] = useState(false);
  const isProcessingProfileLinkRef = useRef(false); // Using ref instead of let

  const clickOnProfileLink = useCallback(() => {
    // Prevent if already processing or already clicked
    if (isProcessingProfileLinkRef.current || isProfileLinkClicked) {
      return;
    }

    isProcessingProfileLinkRef.current = true;
    setProfileLinkClicked(true);
    console.log('called');

    const profile_link = `
    (function() {
      const element = document.querySelector('.edit_link');
      if (element) {
        console.log('Profile link clicked');
        element.click();
         window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPTION_AVAIl',
            message: 'Clicked and now options is Availa',
            value: true,
            success: true
          }));
        return true;
      }
      console.warn('Profile link not found');
      return false;
    })();
  `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(profile_link);
    }

    // Reset after some time (e.g., 5 seconds)
    setTimeout(() => {
      isProcessingProfileLinkRef.current = false;
      setProfileLinkClicked(false);
    }, 5000);
  }, [isProfileLinkClicked]);

  const toggleLotteryDisableAndPlay = useCallback(() => {
    const script = `
    (function() {
      // 1. Function to disable lottery
      const disableLottery = () => {
        // Try to find checkbox directly
        const checkbox = document.getElementById('disable_lottery_checkbox');
        
        if (checkbox) {
          if (!checkbox.checked) {
            checkbox.click();
            return true; // Lottery was disabled
          }
          return false; // Already disabled
        }
        
        // If checkbox not found, expand section
        const headers = document.querySelectorAll('.reward_category_name.center');
        const targetHeader = Array.from(headers).find(h => 
          h.textContent.includes('DISABLE LOTTERY & INTEREST')
        );
        
        if (targetHeader) {
          targetHeader.click();
          
          // Wait for checkbox to appear
          const checkboxAfterExpand = document.getElementById('disable_lottery_checkbox');
          if (checkboxAfterExpand && !checkboxAfterExpand.checked) {
            checkboxAfterExpand.click();
            return true;
          }
        }
        return false;
      };

      // 2. Function to click free play
      const clickFreePlay = () => {
        const freePlayBtn = document.querySelector('.free_play_link.hide_menu');
        if (freePlayBtn) {
          freePlayBtn.click();
          return true;
        }
        return false;
      };

      // 3. Execute with delay
      const lotteryDisabled = disableLottery();
      
      setTimeout(() => {
        const playClicked = clickFreePlay();
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOTTERY_AND_PLAY_RESULT',
          lotteryAction: lotteryDisabled ? 'DISABLED_NOW' : 'ALREADY_DISABLED',
          playAction: playClicked ? 'CLICKED' : 'NOT_FOUND'
        }));
      }, 1000);
    })();
  `;

    webViewRef.current?.injectJavaScript(script);
  }, []);

  const onMessages = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // setBTbalance(data)
    const type = data?.type;
    console.log(type);
    switch (type) {
      case 'signupFormAvail':
        sethideOverlay(false);
        loginandSignUp();
        break;
      case 'ROLL_CLICKED':
        console.log(data);
        break;

      case 'signupFormNotAvail':
        sethideOverlay(true);
        // clickOnProfileLink();
        disableLottery();
        getMyRewardPoints();
        is2FAEnabled();
        getwithdrawalAddress();
        if (userDetails?.isAdmin) {
          referhistory();
        }
        if (!userDetails?.freebtcReferCode) {
          referalCode();
        }
        // loginandSignUp();
        break;

      case 'REFER_VALUE':
        console.log(data);
        const referValue = data?.value;
        if (referValue) {
          const referralId = referValue.split('?r=')[1]; // Split and get part after "?r="

          saveFreebtcReferCode(referralId);
          setuserDetails(pre => ({ ...pre, freebtcReferCode: referralId }));
        }

        break;

      case 'OPTION_AVAIl':
        // toggleLotteryDisableAndPlay();
        break;

      case 'REFERRAL_ADDRESSES':
        console.log(data);
        if (userDetails.isAdmin) {
          // showNotification(data.message, 'success');
          saveReferHistoryinDb(data.value);
        }
        break;

      case 'REWARD_POINTS':
        setStats(pre => ({
          ...pre,
          rewards: data.value.points,
          tickets: data.value.tickets,
        }));
        console.log(data);
        break;

      case 'LOTTERY_CHECK_BOX':
        console.log(data.value);
        // setStats(pre => ({...pre, isLotteryDisbaled: data.value}));
        console.log(data);
        break;

      case 'WITHDRAWAL_ADDRESS':
        if (data.success) {
          addAddress(data.value);
        }
        // console.log(data);
        break;
      case '2FA_STATUS_CHECK':
        // clickOnProfileLink()
        const is2FA = data?.content?.parentStyles?.display;
        const text = is2FA == 'none' ? 'DISABLED' : 'ENABLED';
        setStats(pre => ({ ...pre, twoFaStatus: text }));
        console.log(data);
        break;

      case 'TURNSTILE_TOKEN':
        // showNotification('Captcha Verified', 'success');
        console.log(data);
        break;

      case 'BUTTON_AVAILABLE':
        rollwithButton();
        break;

      case 'TIMER_INITIAL':
        console.log(data);
        setBTbalance(data);
        break;
      case 'REFERRAL_ERROR':
        console.log(data);
        break;

      case 'ROLL_RESULT':
        if (data.btc) {
          console.log(data.btc);
          SaveRollhistotyinDb(data.btc);
        }
        break;

      case 'MODAL_STATE_UPDATE':
        console.log(data);
        // if (
        //   data.display !== 'none' ||
        //   data.visibility !== 'hidden' ||
        //   data.hasOpenClass
        // ) {
        //   hideModalIfOpen(); // Only hide if modal is open
        // }
        break;
    }
  };

  const saveReferHistoryinDb = async _data => {
    const filterDat = _data.filter(
      x => x !== 'REFERRAL ADDRESS' && x !== 'TOTAL',
    );
    console.log(filterDat);
    const unique = [...new Set(filterDat)];
    console.log(unique.length);
    try {
      const res = await fetchData({
        url: '/adminReferalRoutes/AddAllAdresses',
        method: 'POST',
        data: {
          addresses: unique,
        },
      });
      console.log(res);
    } catch (error) {}
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

  const referhistory = async () => {
    const injectJs = `
    (function() {
      function extractAddresses() {
        return Array.from(
          document.querySelectorAll('#referral_list_table tbody tr td:first-child')
        ).map(td => td.textContent.trim());
      }

      function waitForStableList(callback, timeout = 15000, interval = 300) {
        let previousCount = 0;
        let stableTicks = 0;
        const maxStableTicks = 3; // must be stable for 3 intervals

        const startTime = Date.now();
        const timer = setInterval(() => {
          const addresses = extractAddresses();
          if (addresses.length === previousCount) {
            stableTicks++;
          } else {
            stableTicks = 0;
            previousCount = addresses.length;
          }

          if (stableTicks >= maxStableTicks) {
            clearInterval(timer);
            callback(addresses);
          } else if (Date.now() - startTime > timeout) {
            clearInterval(timer);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'REFERRAL_ERROR',
              message: 'Timeout waiting for referral data',
              success: false
            }));
          }
        }, interval);
      }

      function sendAddresses(addresses) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REFERRAL_ADDRESSES',
          message: addresses.length + ' addresses found',
          value: addresses,
          success: true
        }));
      }

      const showAllButton = document.getElementById('show_all_refs');
      if (showAllButton) {
        showAllButton.click();
        waitForStableList(sendAddresses, 20000);
      } else {
        const addresses = extractAddresses();
        sendAddresses(addresses);
      }
    })();
  `;

    webViewRef.current.injectJavaScript(injectJs);
  };

  const referalCode = () => {
    const injectjs = `(function () {
      const referralInput = document.querySelector(
        'input[value*="https://freebitco.in/?r"]',
      );
      if (referralInput) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'REFER_VALUE',
            message: 'Referal Value found',
            value: referralInput.value,
            success: true,
          }),
        );
      }else{
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'REFER_VALUE',
            message: 'Referal Not Value found',
            value: null,
            success: false,
          }),
        );
      }
    })()  `;

    webViewRef.current.injectJavaScript(injectjs);
  };
  const [hideOverlay, sethideOverlay] = useState(false);

  const [showModalTrue, setShowModalTrue] = useState(false);

  return (
    <>
      <View
        style={{
          zIndex: 9999,
        }}
      >
        <Toast position="top" swipeable topOffset={100} />
        <FixNowModal
  visible={showModalTrue}
  onClose={() => setShowModalTrue(false)}
  title="Issue found"
  message="Your device or Account not properly Set for Notification."
  buttonText="Login Now"
  onButtonPress={() => {
    // setShowModal(false);

  }}
  userDetails={userDetails}
/>
      </View>
      {token ? (
        <>
          <View
            style={[
              {
                position: 'absolute',
              },
              ViewStyle?.dashboard,
            ]}
          >
            <DashBoard webViewData={webViewData}
            showModalTrue ={showModalTrue}
            
            setShowModalTrue={setShowModalTrue}
            />
          </View>

          <View style={[styles.hiddenWebViewContainer, ViewStyle?.webView]}>
            <WebView
              ref={webViewRef}
              source={{ uri: 'https://freebitco.in/' }}
              injectedJavaScript={injectedJavaScript}
              onMessage={onMessages}
              onLoadEnd={handleWebViewLoad}
              style={styles.hiddenWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              // renderLoading={() => (
              //   <View style={styles.loadingContainer}>
              //     <ActivityIndicator size="large" color="#6200ee" />
              //   </View>
              // )}
              // userAgent=" /5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              mixedContentMode="always"
            />
            {/* {!hideOverlay && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#e6e0e0" />
                <Text style={styles.overlayText}>
                  Please wait, we are Syncing Data.in…
                </Text>
              </View>
            )} */}
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
    // marginTop: hp(5),
    // position: 'absolute',
    zIndex: 2,
  },
  hiddenWebView: {
    marginTop: StatusBar.currentHeight,
  },
  overlay: {
    position: 'absolute',
    top: hp(20),
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#291c15',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: hp(60),
  },
  overlayText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#fffafa',
    textAlign: 'center',
  },
});

export default Home;

// import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import WebviewLayout from './Layout/WebviewLayout';
// import { useAuth } from '../hooks/useAuth';

// export default function Home() {
//   const [isAbsolute, setIsAbsolute] = useState(true);
//   const { isLoggedIn } = useAuth();

//   useEffect(() => {
//     if (isLoggedIn) {
//       setIsAbsolute(true); // start absolute with overlay
//       const timer = setTimeout(() => {
//         setIsAbsolute(false); // switch to static after 2 sec
//       }, 2000);

//       return () => clearTimeout(timer);
//     }
//   }, [isLoggedIn]);

//   return (
//       <WebviewLayout visible={true} />

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   overlayText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#000',
//     fontWeight: '500'
//   }
// });
