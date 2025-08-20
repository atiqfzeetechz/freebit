// context/GlobalRefContext.tsx
import React, { createContext, useRef, useContext, ReactNode } from "react";
import { WebView } from "react-native-webview";

export type GlobalRefContextType = {
  webViewRef: React.MutableRefObject<WebView | null>;
};

export const GlobalRefContext = createContext<GlobalRefContextType | undefined>(undefined);

export const GlobalRefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const webViewRef = useRef<WebView | null>(null); // 👈 typed ref

  return (
    <GlobalRefContext.Provider value={{ webViewRef }}>
      {children}
    </GlobalRefContext.Provider>
  );
};


