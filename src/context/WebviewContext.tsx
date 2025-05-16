// WebViewContext.js
import React, { createContext, useContext, useState } from 'react';

export const WebViewContext = createContext(null);

export const useWebView = () => useContext(WebViewContext);

export const WebViewProvider = ({ children }) => {
  const [shouldLogout, setShouldLogout] = useState(false);

  const triggerLogout = () => {
    setShouldLogout(true);
  };

  const clearLogoutFlag = () => {
    setShouldLogout(false);
  };

  return (
    <WebViewContext.Provider value={{ shouldLogout, triggerLogout, clearLogoutFlag }}>
      {children}
    </WebViewContext.Provider>
  );
};
