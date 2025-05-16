import { StyleSheet, View } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { hp } from '../helper/hpwp';

export default function TestComp({setHistory ,setLoading ,refreshing}:any) {
  const [hasInjectedClick, setHasInjectedClick] = useState(false);
  const [hasInjectedExtract, setHasInjectedExtract] = useState(false);
  const webviewRef = useRef(null);


  
  useEffect(()=>{
    if(refreshing && webviewRef.current){

    }
  },[refreshing])
  // Step 1: JavaScript to click the link
  const clickLinkJS = `
    (function() {
      const doubleBtcLink = document.querySelector('.double_your_btc_link');
      if (doubleBtcLink) {
        const clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        doubleBtcLink.dispatchEvent(clickEvent);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'double_btc_link_clicked', success: true }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'double_btc_link_not_found', success: false }));
      }
      true;
    })();
  `;

  // Step 2: JavaScript to extract bet history
  const extractBetHistoryJS = `
    (function() {
      function extractBetHistory() {
        const historyRows = document.querySelectorAll(".multiply_bet_history_table_row");
        const betHistory = [];
        const cleanText = (text) => text ? text.replace(/\\s+/g, " ").trim() : "";

        historyRows.forEach((row) => {
          const rowContainer = row.querySelector(".lottery_winner_table_box_container");
          if (!rowContainer) return;

          let dateElement = row.previousElementSibling;
          while (dateElement && !dateElement.id.startsWith("multiply_history_date_row_")) {
            dateElement = dateElement.previousElementSibling;
          }

          const date = dateElement ? cleanText(dateElement.textContent).replace("DATE: ", "") : "Unknown";

          const cells = rowContainer.querySelectorAll('[class*="lottery_winner_table_box"]');
          if (cells.length < 9) return;

          const balanceInfo = row.querySelector(".balance_before_after");
          const balanceCells = balanceInfo ? balanceInfo.querySelectorAll(".balance_after_bet_column") : [];

          const bet = {
            date,
            time: cleanText(cells[0].textContent).replace("16:00:02", "").trim(),
            game: cleanText(cells[1].textContent),
            bet: cleanText(cells[2].textContent),
            roll: cleanText(cells[3].textContent),
            stake: cleanText(cells[4].textContent),
            multiplier: cleanText(cells[5].textContent),
            profit: cleanText(cells[6].textContent),
            jackpot: cleanText(cells[7].textContent),
            verifyLink: cells[8].querySelector("a") ? cells[8].querySelector("a").href : "",
            balanceBefore: balanceCells[0] ? cleanText(balanceCells[0].textContent) : "",
            balanceAfter: balanceCells[1] ? cleanText(balanceCells[1].textContent) : "",
            bonusBalanceBefore: balanceCells[2] ? cleanText(balanceCells[2].textContent) : "",
            bonusBalanceAfter: balanceCells[3] ? cleanText(balanceCells[3].textContent) : "",
          };

          betHistory.push(bet);
        });

        return betHistory;
      }

      const betHistory = extractBetHistory();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'bet_history_extracted', data: betHistory }));
      true;
    })();
  `;

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      if (data.type === 'double_btc_link_clicked' && data.success && !hasInjectedExtract) {
        setTimeout(() => {
          webviewRef.current.injectJavaScript(extractBetHistoryJS);
          setHasInjectedExtract(true);
        }, 3000); // Wait 3s before extracting to allow page change
      }

      if (data.type === 'bet_history_extracted') {
        
        setHistory(data.data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const onLoadEnd = () => {
    if (!hasInjectedClick) {
      webviewRef.current.injectJavaScript(clickLinkJS);
      setHasInjectedClick(true);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: 'https://freebitco.in/' }}
        style={styles.webview}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: hp(5),
    opacity:0,
    zIndex:-1
  },
  webview: {
    flex: 1,
  },
});
