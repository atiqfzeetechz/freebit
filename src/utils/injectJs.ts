//   const injectedJavaScript = `
  //     (function() {
  //         let dataExtracted = false;
  //         let retryCount = 0;
  //         const MAX_RETRIES = 2;
  //         const currentUrl = window.location.href;

  //       window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_URL', url: currentUrl }));

  //       function extractTimer() {
  //         try {
  //           const timerElement = document.getElementById('time_remaining');
  //           if (!timerElement) return null;

  //           const amountElements = timerElement.querySelectorAll('.countdown_amount');
  //           const minutesElement = amountElements[0];
  //           const secondsElement = amountElements[1];

  //           return {
  //             minutes: minutesElement ? minutesElement.textContent.trim() : '00',
  //             seconds: secondsElement ? secondsElement.textContent.trim() : '00'
  //           };
  //         } catch (error) {
  //           console.error('Timer extraction error:', error);
  //           return { minutes: '00', seconds: '00' };
  //         }
  //       }

  //   function setupFreePlayButtonObserver() {
  //     const freePlayButton = document.querySelector('#free_play_form_button');

  //     if (freePlayButton) {
  //       const initialDisplay = window.getComputedStyle(freePlayButton).display;
  //       window.ReactNativeWebView.postMessage(JSON.stringify({
  //         type: 'freePlayButtonDisplayChange',
  //         isVisible: initialDisplay === 'inline-block',
  //         displayValue: initialDisplay,
  //         message: 'Initial free play button state captured'
  //       }));

  //       const observer = new MutationObserver(function(mutations) {
  //         mutations.forEach(function(mutation) {
  //           if (mutation.type === 'attributes' &&
  //               (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
  //             const currentDisplay = window.getComputedStyle(freePlayButton).display;

  //             window.ReactNativeWebView.postMessage(JSON.stringify({
  //               type: 'freePlayButtonDisplayChange',
  //               isVisible: currentDisplay === 'inline-block',
  //               displayValue: currentDisplay,
  //               message: 'Free play button display changed'
  //             }));

  //             const canRoll = !freePlayButton.disabled;
  //             window.ReactNativeWebView.postMessage(JSON.stringify({
  //               type: 'freePlayButtonAvailability',
  //               canRoll: canRoll,
  //               message: canRoll ? 'Button is enabled' : 'Button is disabled'
  //             }));
  //           }
  //         });
  //       });

  //       observer.observe(freePlayButton, {
  //         attributes: true,
  //         attributeFilter: ['style', 'class']
  //       });

  //       return true;
  //     }
  //     return false;
  //   }

  //   function monitorCaptcha() {
  //     const captchaField = document.querySelector('[name="cf-turnstile-response"]');
  //     const signUpButton = document.querySelector('#signup_button');
  //     let lastCaptchaValue = '';

  //     if (captchaField) {
  //       if (captchaField.value && captchaField.value !== lastCaptchaValue) {
  //         lastCaptchaValue = captchaField.value;
  //         window.ReactNativeWebView.postMessage(JSON.stringify({
  //           type: 'captchaValue',
  //           value: captchaField.value,
  //           message: 'Initial captcha value found'
  //         }));
  //       }

  //       const observer = new MutationObserver(function(mutations) {
  //         mutations.forEach(function(mutation) {
  //           if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
  //             if (captchaField.value !== lastCaptchaValue) {
  //               lastCaptchaValue = captchaField.value;

  //               window.ReactNativeWebView.postMessage(JSON.stringify({
  //                 type: 'captchaValue',
  //                 value: captchaField.value,
  //                 message: 'Captcha value changed'
  //               }));

  //               if (signUpButton) {
  //                 window.ReactNativeWebView.postMessage(JSON.stringify({
  //                   type: 'Captcha&form',
  //                   value: captchaField.value,
  //                   message: 'Captcha value changed with signup button present'
  //                 }));
  //               }
  //             }
  //           }
  //         });
  //       });

  //       observer.observe(captchaField, {
  //         attributes: true,
  //         attributeFilter: ['value']
  //       });

  //       return true;
  //     }
  //     return false;
  //   }

  //   function extractDataOnce() {
  //     if (dataExtracted || retryCount >= MAX_RETRIES) return;

  //     try {
  //       const balanceElement = document.querySelector('#balance');
  //       const balance = balanceElement ? balanceElement.innerText : null;
  //       const isplay_without_captchas_button = document.querySelector('#play_without_captchas_button');

  //       if (isplay_without_captchas_button) {
  //         window.ReactNativeWebView.postMessage(JSON.stringify({
  //           type: 'Play_withoutCaptcha',
  //           available: true,
  //           message: 'Play without captchas button found'
  //         }));
  //       }

  //       const rollButton = document.querySelector('#free_play_form_button');
  //       const canRoll = !!rollButton && !rollButton.disabled;

  //       const timer = extractTimer();

  //       const captchaFound = monitorCaptcha();
  //       const freePlayObserverSetUp = setupFreePlayButtonObserver();

  //       if (balance !== null || timer !== null || freePlayObserverSetUp) {
  //         dataExtracted = true;
  //         window.ReactNativeWebView.postMessage(JSON.stringify({
  //           type: 'page_data',
  //           balance: balance,
  //           canRoll: canRoll,
  //           timer: timer,
  //           timestamp: new Date().toISOString(),
  //           captchaAvailable: captchaFound,
  //           freePlayObserverSetUp: freePlayObserverSetUp,
  //           message: 'Initial page data extracted'
  //         }));
  //       } else {
  //         throw new Error('Elements not found');
  //       }
  //     } catch (error) {
  //       retryCount++;
  //       if (retryCount < MAX_RETRIES) {
  //         setTimeout(extractDataOnce, 1000);
  //       } else {
  //         window.ReactNativeWebView.postMessage(JSON.stringify({
  //           type: 'extraction_error',
  //           error: 'Max retries reached. Elements not found.',
  //           message: 'Failed to extract data after maximum retries'
  //         }));
  //       }
  //     }
  //   }

  //   let signupRetryCount = 0;
  //   const SIGNUP_MAX_RETRIES = 5;

  //   function tryInjectSignup() {
  //     if (signupRetryCount >= SIGNUP_MAX_RETRIES) return;

  //     const signupForm = document.querySelector('#signup_form_div');
  //     const isRollButtonAvail = document.querySelector('#free_play_form_button');
  //     const captchaField = document.querySelector('[name="cf-turnstile-response"]');

  //     if (isRollButtonAvail) {
  //       window.ReactNativeWebView.postMessage(JSON.stringify({
  //         type: 'roll_Button',
  //         avail: true,
  //         message: 'Roll button is available'
  //       }));
  //     }

  //     if (isRollButtonAvail && captchaField && captchaField.value) {
  //       window.ReactNativeWebView.postMessage(JSON.stringify({
  //         type: 'rollButton&captcha',
  //         avail: true,
  //         message: 'Roll button and captcha are both available'
  //       }));
  //     }

  //     if (signupForm) {
  //       const emailAddress = document.querySelector('#signup_form_email');
  //       const password = document.querySelector('#signup_form_password');
  //       const signUpButton = document.querySelector('#signup_button');
  //       const referrerCode = document.querySelector('#referrer_in_form');
  //       const captchaField = document.querySelector('[name="cf-turnstile-response"]');

  //       function sendFormValues() {
  //         const message = {
  //           type: 'form_values',
  //           email: emailAddress?.value || '',
  //           password: password?.value || '',
  //           referrerCode: referrerCode?.value || '',
  //           message: 'Current form values'
  //         };
  //         window.ReactNativeWebView.postMessage(JSON.stringify(message));
  //       }

  //       sendFormValues();

  //       if (signUpButton) {
  //         signUpButton.addEventListener('click', function() {
  //           window.ReactNativeWebView.postMessage(JSON.stringify({
  //             type: 'button_clicked',
  //             message: 'Signup button clicked'
  //           }));
  //         });
  //       }

  //       if (signUpButton && captchaField && captchaField.value) {
  //         window.ReactNativeWebView.postMessage(JSON.stringify({
  //           type: 'signup_ready',
  //           message: 'Signup button and captcha are both available'
  //         }));
  //       }
  //     } else {
  //       signupRetryCount++;
  //       setTimeout(tryInjectSignup, 1000);
  //     }
  //   }

  //   // Initial execution
  //   extractDataOnce();
  //   tryInjectSignup();

  //   true;
  // })();
  // `;
