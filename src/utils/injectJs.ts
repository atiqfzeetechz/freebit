  export const injectedJavaScript = `
  (function() {
    // Configuration
    const MAX_RETRIES = 5;
    const SIGNUP_MAX_RETRIES = 5;
    const RETRY_DELAY = 1000;
    
    // State tracking
    let dataExtracted = false;
    let retryCount = 0;
    let signupRetryCount = 0;
    let captchaObserver = null;
    const currentUrl = window.location.href;
  
    // Helper function to send messages
    function sendMessage(type, data = {}) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type,
        ...data,
        timestamp: new Date().toISOString()
      }));
    }
  
    // Send initial page URL
    sendMessage('PAGE_URL', { url: currentUrl });
  
    // Timer extraction
    function extractTimer() {
      try {
        const timerElement = document.getElementById('time_remaining');
        if (!timerElement) return null;
        
        const amountElements = timerElement.querySelectorAll('.countdown_amount');
        return {
          minutes: amountElements[0]?.textContent.trim() || '00',
          seconds: amountElements[1]?.textContent.trim() || '00'
        };
      } catch (error) {
        console.error('Timer extraction error:', error);
        return { minutes: '00', seconds: '00' };
      }
    }
  
    // Captcha monitoring
    function setupCaptchaObserver() {
      const captchaField = document.querySelector('[name="cf-turnstile-response"]');
      if (!captchaField) return false;
  
      // Clean up any existing observer
      if (captchaObserver) {
        captchaObserver.disconnect();
      }
  
      // Send initial value if exists
      if (captchaField.value) {
        handleCaptchaChange(captchaField.value);
      }
  
      // Create new observer
      captchaObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            handleCaptchaChange(captchaField.value);
          }
        });
      });
  
      captchaObserver.observe(captchaField, {
        attributes: true,
        attributeFilter: ['value']
      });
  
      return true;
    }
  
    function handleCaptchaChange(value) {
      sendMessage('captchaValue', { value });
      
      // Check for roll button when captcha is ready
      const rollButton = document.querySelector('#free_play_form_button');
      if (rollButton) {
        sendMessage('captcha&Roll', { 
          value: value,
          canRoll: !rollButton.disabled
        });
      }
  
      // Check for signup form when captcha is ready
      const signUpButton = document.querySelector('#signup_button');
      if (signUpButton) {
        sendMessage('signup_ready', {
          message: 'Signup button and captcha are both available'
           value: value,
        });
      }
    }
  
    // Main data extraction
    function extractDataOnce() {
      if (dataExtracted || retryCount >= MAX_RETRIES) return;
  
      try {
        // Extract basic page elements
        const balanceElement = document.querySelector('#balance');
        const playWithoutCaptcha = document.querySelector('#play_without_captchas_button');
        const rollButton = document.querySelector('#free_play_form_button');
        const timer = extractTimer();
        const captchaFound = setupCaptchaObserver();
  
        // Send element statuses
        if (playWithoutCaptcha) {
          sendMessage('Play_withoutCaptcha', { available: true });
        }
  
        if (balanceElement || timer) {
          dataExtracted = true;
          sendMessage('page_data', {
            balance: balanceElement?.innerText || null,
            canRoll: rollButton ? !rollButton.disabled : false,
            timer: timer,
            captchaAvailable: captchaFound
          });
        } else {
          throw new Error('Essential elements not found');
        }
      } catch (error) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          setTimeout(extractDataOnce, RETRY_DELAY);
        } else {
          sendMessage('extraction_error', {
            error: 'Max retries reached. Elements not found.'
          });
        }
      }
    }
  
    // Signup form handling
    function tryInjectSignup() {
      if (signupRetryCount >= SIGNUP_MAX_RETRIES) return;
  
      const signupForm = document.querySelector('#signup_form_div');
      const rollButton = document.querySelector('#free_play_form_button');
  
      if (rollButton) {
        sendMessage('roll_Button', { avail: true });
      }
  
      if (signupForm) {
        const formElements = {
          email: document.querySelector('#signup_form_email'),
          password: document.querySelector('#signup_form_password'),
          signUpButton: document.querySelector('#signup_button'),
          referrerCode: document.querySelector('#referrer_in_form')
        };
  
        // Send initial form values
        sendMessage('form_values', {
          email: formElements.email?.value || '',
          password: formElements.password?.value || '',
          referrerCode: formElements.referrerCode?.value || ''
        });
  
        // Add click listener if button exists
        if (formElements.signUpButton) {
          formElements.signUpButton.addEventListener('click', () => {
            sendMessage('button_clicked', {
              message: 'Signup button clicked'
            });
          });
        }
      } else {
        signupRetryCount++;
        setTimeout(tryInjectSignup, RETRY_DELAY);
      }
    }
  
    // Initial execution
    extractDataOnce();
    tryInjectSignup();
  
    true; // Required for onMessage
  })();
  `;
