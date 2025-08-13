import { createRef, useCallback, useState } from 'react';
import { useData } from '../hooks/useGlobalData';
import { useAuth } from '../hooks/useAuth';

export const webViewRef = createRef();

export const disableLottery = () => {
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

export const getTimerAndBtc = () => {
  const injectedJS = `
    (function () {
      window.getTimerData = function () {
        const timerElement = document.getElementById('time_remaining');
        const balanceElement = document.querySelector('#balance');

        const amountElements = timerElement?.querySelectorAll('.countdown_amount') || [];
        const minutes = amountElements[0]?.textContent.trim() || '00';
        const seconds = amountElements[1]?.textContent.trim() || '00';

        const timerData = {
          minutes,
          seconds,
          balance: balanceElement ? balanceElement.innerText : null,
        };

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'TIMER_DATA',
          ...timerData
        }));

        return timerData;
      };

      // First auto call after load
      const checkAndCall = setInterval(() => {
        if (document.getElementById('time_remaining')) {
          window.getTimerData();
          clearInterval(checkAndCall);
        }
      }, 500);
    })();
    true; // <- important for iOS
  `;

  if (webViewRef?.current) {
    console.log('fghj')
    webViewRef.current.injectJavaScript(injectedJS);
  }
};

// globalWebView.js

export const loginandSignUp = (loginType ,credentials) => {
    console.log({credentials})
  console.log(loginType);
  if (loginType === 'login') {
    // First, click the login button to show the form
    const clickLoginButtonJS = `
      (function() {
        const loginButton = document.querySelector('.login_menu_button');
        const loginForm = document.querySelector('#login_form_div');
        if (loginButton) {
          loginForm.style.setProperty('visibility', 'hidden', 'important');
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

export const rollwithButton = () => {
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

export const getMyRewardPoints = () => {
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

export const is2FAEnabled = () => {
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

export const getwithdrawalAddress = () => {
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

export const referhistory = async () => {
    console.log('called histor')
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


export  const referalCode = () => {
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

export const useWebViewMessages = helpers => {
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
    const [hideOverlay,setHideOverLay]=useState(false)


  const saveFreebtcReferCode =()=>{

  }


  const saveReferHistoryinDb = ()=>{

  }

  const addAddress =()=>{

  } 
   
 const SaveRollhistotyinDb =()=>{

 } 
  const onMessagesGlobal = useCallback(
    event => {
      const data = JSON.parse(event.nativeEvent.data || '{}');
      const type = data?.type;

      console.log('WebView Message global:', type);


      switch (type) {
        case 'signupFormAvail':
            setHideOverLay(false)
          loginandSignUp?.(loginType ,credentials);
          break;

        case 'ROLL_CLICKED':
          console.log(data);
          break;

        case 'signupFormNotAvail':
            setHideOverLay(true)
          disableLottery?.();
          getMyRewardPoints?.();
          is2FAEnabled?.();
          getwithdrawalAddress?.();
          if (userDetails?.isAdmin) {
            referhistory?.();
          }
          if (!userDetails?.freebtcReferCode) {
            referalCode?.();
          }
          break;

        case 'REFER_VALUE':
          const referValue = data?.value;
          if (referValue) {
            const referralId = referValue.split('?r=')[1];
            saveFreebtcReferCode?.(referralId);
            setuserDetails?.(pre => ({
              ...pre,
              freebtcReferCode: referralId,
            }));
          }
          break;

        case 'REFERRAL_ADDRESSES':
          if (userDetails?.isAdmin) {
            saveReferHistoryinDb?.(data.value);
          }
          break;

        case 'REWARD_POINTS':
          setStats?.(pre => ({
            ...pre,
            rewards: data.value.points,
            tickets: data.value.tickets,
          }));
          break;

        case 'WITHDRAWAL_ADDRESS':
          if (data.success) {
            addAddress?.(data.value);
          }
          break;

        case '2FA_STATUS_CHECK':
          const is2FA = data?.content?.parentStyles?.display;
          const text = is2FA === 'none' ? 'DISABLED' : 'ENABLED';
          setStats?.(pre => ({ ...pre, twoFaStatus: text }));
          break;

        case 'BUTTON_AVAILABLE':
          rollwithButton?.();
          break;

        case 'TIMER_INITIAL':
          console.log('TIMER_INITIAL', data);
          setBTbalance?.(data);
          break;

        case 'ROLL_RESULT':
          if (data.btc) {
            SaveRollhistotyinDb?.(data.btc);
          }
          break;

        default:
          console.log('Unhandled message type:', type, data);
      }
    },
    [
    userDetails,
    loginandSignUp,
    disableLottery,
    getMyRewardPoints,
    is2FAEnabled,
    getwithdrawalAddress,
    referhistory,
    referalCode,
    saveReferHistoryinDb,
    setStats,
    addAddress,
    rollwithButton,
    setBTbalance,
    SaveRollhistotyinDb,
    setuserDetails,
    saveFreebtcReferCode
  ], // re-memoize if helpers change
  );

  return { onMessagesGlobal ,hideOverlay,setHideOverLay };
};
