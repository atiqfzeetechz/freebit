// context/GlobalRefContext.tsx
import React, { createContext, useRef, useContext, ReactNode } from "react";
import { WebView } from "react-native-webview";

export type GlobalRefContextType = {
  webViewRef: React.MutableRefObject<WebView | null>;
  onMessages:Function
};

export const GlobalRefContext = createContext<GlobalRefContextType | undefined>(undefined);

export const GlobalRefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const webViewRef = useRef<WebView | null>(null); // 👈 typed ref


// -------------------------message trigger---------------------------------

 const onMessages = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // setBTbalance(data)
    const type = data?.type;
    console.log(type);
    return 
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


  return (
    <GlobalRefContext.Provider value={{ webViewRef ,onMessages}}>
      {children}
    </GlobalRefContext.Provider>
  );
};


