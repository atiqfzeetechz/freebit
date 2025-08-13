import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useWebViewMessages, webViewRef } from '../../helper/globalRef';
import WebView from 'react-native-webview';
import { useWebView } from '../../context/WebviewContext';
import CookieManager from '@react-native-cookies/cookies';
import { useAuth } from '../../hooks/useAuth';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp } from '../../helper/hpwp';

export default function WebviewLayout(props: { visible: boolean }) {
  const { onMessagesGlobal ,hideOverlay,setHideOverLay } = useWebViewMessages({});
  const {
    shouldLogout,
    clearLogoutFlag,
    SyncWebViewClick,
    setSyncWebViewclick,
  } = useWebView();
  const { visible = true } = props;

  const { logout } = useAuth();

  const handleWebViewLoad = () => {};

  const injectedJavaScript = `
  (function () {
  // ================Check for signup or login form=======================

 const isSignUpOrLoginForm = document.querySelector('#signup_form_div');
if (isSignUpOrLoginForm) {
  isSignUpOrLoginForm.style.setProperty('visibility', 'hidden', 'important');
}

// Hide homepage login button
const homepageLoginBtn = document.querySelector('#homepage_login_button');
if (homepageLoginBtn) {
  homepageLoginBtn.style.setProperty('visibility', 'hidden', 'important');
}

// Hide homepage signup button
const homepageSignupBtn = document.querySelector('#homepage_signup_button');
if (homepageSignupBtn) {
  homepageSignupBtn.style.setProperty('visibility', 'hidden', 'important');
}

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
  const buttons = document.querySelectorAll('#free_play_form_button');
  const visibleButton = Array.from(buttons).find(button => 
    button.style.display !== 'none'
  );
  
  if (visibleButton) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'BUTTON_AVAILABLE',
      message: 'Visible button detected in DOM'
    }));
    observeButton.disconnect();
  }
});

observeButton.observe(document.body, {
  childList: true,
  subtree: true
});

// Check for existing button that's not hidden
const buttons = document.querySelectorAll('#free_play_form_button');
const visibleButton = Array.from(buttons).find(button => 
  button.style.display !== 'none'
);

if (visibleButton) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'BUTTON_AVAILABLE',
    message: 'Visible button already exists'
  }));
  observeButton.disconnect();
}

  return true;
})();
`;

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


  useEffect(()=>{
    const timer =setTimeout(()=>{
        setHideOverLay(true)
    },2500)
    return ()=>{
        clearTimeout(timer)
    }
  },[])

  return (
    <View
      style={[
        styles.webViewContainer,
        {
          position: visible ? 'static' : 'absolute',
          height: '100%',
        },
      ]}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://freebitco.in/' }}

        injectedJavaScript={injectedJavaScript}
        onMessage={onMessagesGlobal}
        onLoadEnd={handleWebViewLoad}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
      />
      {!hideOverlay &&  <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#e6e0e0" />
          <Text style={styles.overlayText}>
            Please wait, we are Syncing Data.in…
          </Text>
        </View>}
      
    </View>
  );
}

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: StatusBar.currentHeight,
    // position:"absolute"
  },
  webView: {
    flex: 1,
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
    height:hp(60),
    
  },
  overlayText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#fffafa',
    textAlign: 'center',
  },
});
