import React from 'react';
import { User } from '../context/AuthContext';
import { webViewRef } from './globalWebViewRef';




export  const injectedJavaScript = `
(function () {
  // ====================================================
  // 1. SIGNUP / LOGIN FORM CHECK
  // ====================================================
  const isSignUpOrLoginForm = document.querySelector('#signup_form_div');

  if (isSignUpOrLoginForm) {
    // Keep form in DOM but overlay "Syncing Data" message
    isSignUpOrLoginForm.style.setProperty('position', 'relative', 'important');

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
          🚀 Syncing Data, Please wait...
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

  // Notify RN about signup form status
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: isSignUpOrLoginForm ? 'signupFormAvail' : 'signupFormNotAvail',
    message: isSignUpOrLoginForm ? 'Signup or LoginForm' : 'Signup not LoginForm'
  }));

  // ====================================================
  // 2. MODAL OBSERVER
  // ====================================================
  function setupModalObserver() {
    const modal = document.getElementById('myModal22');
    if (!modal) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODAL_NOT_FOUND',
        message: 'Modal not found in DOM'
      }));
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

      // Try auto-close modal if visible
      if (styles.display === 'block' && styles.visibility === 'visible' && closeButton) {
        closeButton.click();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MODAL_CLOSE_ATTEMPTED',
          message: 'Attempted to close modal via click'
        }));
      }
    }

    // Initial report
    reportModalState();

    // Watch for style/class/child changes
    const observer = new MutationObserver((mutations) => {
      let shouldReport = false;
      mutations.forEach((mutation) => {
        if (
          mutation.target === modal &&
          mutation.type === 'attributes' &&
          ['style', 'class'].includes(mutation.attributeName)
        ) {
          shouldReport = true;
        }
        if (mutation.type === 'childList') {
          const addedClose = Array.from(mutation.addedNodes)
            .some(node => node.classList?.contains('close-reveal-modal'));
          const removedClose = Array.from(mutation.removedNodes)
            .some(node => node.classList?.contains('close-reveal-modal'));
          if (addedClose || removedClose) shouldReport = true;
        }
      });
      if (shouldReport) reportModalState();
    });

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

  setupModalObserver();

  // ====================================================
  // 3. CHANGE EMAIL BUTTON LISTENER
  // ====================================================
  const changeEmailBtn = document.getElementById('change_email_button');
  if (changeEmailBtn) {
    changeEmailBtn.addEventListener('click', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CHANGE_EMAIL_CLICKED',
        message: 'User clicked change_email_button'
      }));
    });
  } else {
    // Watch for dynamically added button
    const emailBtnObserver = new MutationObserver(() => {
      const btn = document.getElementById('change_email_button');
      if (btn) {
        btn.addEventListener('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CHANGE_EMAIL_CLICKED',
            message: 'User clicked change_email_button'
          }));
        });
        emailBtnObserver.disconnect();
      }
    });
    emailBtnObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ====================================================
  // 4. TIMER & BALANCE OBSERVER
  // ====================================================
  function extractAndPostTimer() {
    const timerEl = document.getElementById('time_remaining');
    const balanceEl = document.querySelector('#balance');
    if (!timerEl) return;

    const amounts = timerEl.querySelectorAll('.countdown_amount');
    const minutes = amounts[0]?.textContent.trim() || '00';
    const seconds = amounts[1]?.textContent.trim() || '00';

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'TIMER_INITIAL',
      minutes,
      seconds,
      balance: balanceEl?.innerText,
      message: 'Timer initially detected'
    }));
  }

  const timerObserver = new MutationObserver(() => {
    const timerContainer = document.getElementById('time_remaining');
    if (timerContainer) {
      extractAndPostTimer();
      timerObserver.disconnect();
    }
  });

  timerObserver.observe(document.body, { childList: true, subtree: true });
  if (document.getElementById('time_remaining')) {
    extractAndPostTimer();
    timerObserver.disconnect();
  }

  // ====================================================
  // 5. BUTTON OBSERVER
  // ====================================================
  const buttonObserver = new MutationObserver(() => {
    const buttons = document.querySelectorAll('#free_play_form_button');
    const visibleButton = Array.from(buttons).find(b => b.style.display !== 'none');

    if (visibleButton) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'BUTTON_AVAILABLE',
        message: 'Visible button detected'
      }));
      buttonObserver.disconnect();
    }
  });

  buttonObserver.observe(document.body, { childList: true, subtree: true });


// ====================================================
// 6. NETWORK REQUEST INTERCEPTOR (Fetch + XHR) - UPDATED
// ====================================================
// Patch fetch
const origFetch = window.fetch;
window.fetch = async function(...args) {
  // Capture request data before sending
  const requestData = {
    url: args[0],
    method: args[1]?.method || 'GET',
    headers: args[1]?.headers,
    body: args[1]?.body
  };

  const response = await origFetch.apply(this, args);
  
  try {
    const cloned = response.clone();
    cloned.text().then(body => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "API_RESPONSE",
        request: requestData,  // Include request details
        response: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: body
        }
      }));
    });
  } catch (e) {
    console.error('Error intercepting fetch response:', e);
  }
  
  return response;
};



})();
`;

export const getwithdrawalAddress = (webViewRef: any) => {
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

export const loginandSignUp = (
  webViewRef: React.RefObject<any>,
  loginType: String | undefined,
  userDetails?: any,
  credentials?: any,
): void => {
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

export const disableLottery = (webViewRef: React.RefObject<any>) => {
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

export const getMyRewardPoints = (webViewRef: React.RefObject<any>) => {
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

export const is2FAEnabled = (webViewRef: React.RefObject<any>) => {
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

export const referhistory = async (webViewRef: React.RefObject<any>) => {
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

export const referalCode = (webViewRef: React.RefObject<any>) => {
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

export const rollwithButton = (webViewRef: React.RefObject<any>) => {
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

export  const handleReloadWebView = (webViewRef: React.RefObject<any>) => {
    console.log('called');
    if (webViewRef.current) {
      console.log('reload Clicked');
      webViewRef.current.reload(); // reloads the webview
    }
  };
