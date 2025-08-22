import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';

import { WebView } from 'react-native-webview';
import { hp } from '../helper/hpwp';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import DashBoard from '../components/DashBoard';
import useAxios from '../hooks/useAxios';

import { useWebView } from '../context/WebviewContext';
import CookieManager from '@react-native-cookies/cookies';
import { showNotification } from '../utils/Notify';
import Toast from 'react-native-toast-message';
import { useData } from '../hooks/useGlobalData';
import { startForegroundService } from '../helper/service';
import { setWebViewRef } from '../utils/globalWebViewRef';
import { ActivityIndicator, Appbar, Button } from 'react-native-paper';
import FixNowModal from '../helper/FixNowModal';
import ReloadSvg from '../../assets/svg/colored-refresh.svg';
import {
  disableLottery,
  getFunValue,
  getMyRewardPoints,
  getwithdrawalAddress,
  handleReloadWebView,
  is2FAEnabled,
  loginandSignUp,
  referalCode,
  referhistory,
  rollwithButton,
} from '../utils/webViewHelper';
import { useGlobalRef } from '../hooks/useGlobalRef';

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

  const { stats, setStats,funCoinStats,setFunCoinStats } = useData();
 
  const {webViewRef}=useGlobalRef()
  console.log(webViewRef)
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

  const [ViewStyle, setViewStyle] = useState({});

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

  const SaveRollhistotyinDb = async (btc: any) => {
    try {
      const res = await fetchData({
        url: `/user/roll/new`,
        method: 'POST',
        data: {
          btc: btc,
        },
        loader: true,
      });

      // LevelSatoshiDistribute();
      // refreshWebView();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleWebViewLoad = () => {
    console.log('fully loaded');

    // WebView loaded handler if console.log("WebView Loaded, injecting JS...");
    webViewRef.current?.injectJavaScript(injectedJavaScript);
    setWebViewRef(webViewRef);
  };

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


  const injectedJavaScript = `
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

  let emailChangeTimeout = null;
  const onMessages = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // setBTbalance(data)
    const type = data?.type;
    console.log(type);
    switch (type) {
      case 'signupFormAvail':
        sethideOverlay(false);
        loginandSignUp(webViewRef, loginType, userDetails, credentials);
        break;
      case 'ROLL_CLICKED':
        console.log(data);
        break;

      case 'signupFormNotAvail':
        sethideOverlay(true);
        // clickOnProfileLink();
        disableLottery(webViewRef);
        getMyRewardPoints(webViewRef);
        is2FAEnabled(webViewRef);
        getwithdrawalAddress(webViewRef);
        getFunValue(webViewRef);
        if (userDetails?.isAdmin) {
          referhistory(webViewRef);
        }
        if (!userDetails?.freebtcReferCode) {
          referalCode(webViewRef);
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
        rollwithButton(webViewRef);
        break;

      case 'TIMER_INITIAL':
        console.log(data);
        setBTbalance(data);
        break;
      case 'REFERRAL_ERROR':
        console.log(data);
        break;

      case 'ROLL_RESULT':
        SaveRollhistotyinDb('0.00000002');

        break;
         case 'FUN_STATS':
       console.log(data)
        setFunCoinStats({
          token:data.tokens,
          valueinBtc:data.btc
        })

        break;

      case 'MODAL_STATE_UPDATE':
        console.log(data);

        break;

       case 'API_RESPONSE':
        console.log(data)
        if (data.response.body.includes('s:Email changed succesfully')) {
          clearTimeout(emailChangeTimeout);
          emailChangeTimeout = setTimeout(() => {
            const requestBody = data.request.body;
            const emailMatch = requestBody.match(/new_email=([^&]*)/);
            const newEmail = emailMatch
              ? decodeURIComponent(emailMatch[1])
              : null;

            if (newEmail) {
              console.log('🔄 Processing email change for:', newEmail);
              changeEmailApiCall(newEmail);
              // this.checkEmailFunction(newEmail);
            }
          }, 500); // 500ms delay to catch multiple events
        }

        break;

      case 'XHR_RESPONSE':
        console.log('✅ XHR Response:', data);
        break;
    }
  };

  const changeEmailApiCall = async (email: String) => {
    console.log('capi calling for new email');
    const res = await fetchData({
      url: '/user/auth/changeEmail',
      method: 'PATCH',
      data: {
        email: email,
      },
    });
    console.log(res);
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
            <DashBoard
              webViewData={webViewData}
              showModalTrue={showModalTrue}
              setShowModalTrue={setShowModalTrue}
            />
          </View>

          <View style={[styles.hiddenWebViewContainer, ViewStyle?.webView]}>
            <Appbar.Header>
              <Appbar.Content title="Home" titleStyle={{
            fontSize: 18,
            fontWeight: '800',
          }} />

              <Appbar.Action
                icon={() => (
                  <TouchableOpacity
                    onPress={() => {
                      handleReloadWebView(webViewRef);
                    }}
                  >
                    <ReloadSvg width={25} height={25} />
                  </TouchableOpacity>
                )}
              />
            </Appbar.Header>
            {/* <Button
            style={{
              position
            }}
            >Reload</Button> */}
            <WebView
              ref={webViewRef}
              source={{ uri: 'https://freebitco.in/' }}
              injectedJavaScript={injectedJavaScript}
                // injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
                injectedJavaScriptBeforeContentLoaded={injectedJavaScript} // Runs earliest
              onMessage={onMessages}
              onLoadEnd={handleWebViewLoad}
              style={styles.hiddenWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
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

    zIndex: 2,
  },
  hiddenWebView: {},
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
