// src/utils/globalWebViewRef.js
import { createRef } from 'react';

export const webViewRef = createRef();

export const setWebViewRef = (instance) => {
  webViewRef.current = instance;
};

export const getWebViewRef = () => webViewRef;

// Your JS injection function
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

  if (webViewRef.current) {
    webViewRef.current?.current?.injectJavaScript(getRewardsData);
    console.log('Injected getMyRewardPoints JS');
  } else {
    console.log('WebView ref not available to inject JS');
  }
};
