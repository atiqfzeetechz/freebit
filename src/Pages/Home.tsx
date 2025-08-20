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
import ReloadSvg from '../../assets/svg/reload.svg';
import {
  disableLottery,
  getMyRewardPoints,
  getwithdrawalAddress,
  handleReloadWebView,
  injectedJavaScript,
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

  const { stats, setStats } = useData();
 
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
                    <ReloadSvg width={20} height={20} />
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
              // injectedJavaScript={injectedJavaScript}
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
