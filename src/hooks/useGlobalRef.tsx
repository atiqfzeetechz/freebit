import { useContext } from "react";
import { GlobalRefContext, GlobalRefContextType } from "../context/RefContext";

export const useGlobalRef = (): GlobalRefContextType => {
  const context = useContext(GlobalRefContext);
  if (!context) {
    throw new Error("useGlobalRef must be used within a GlobalRefProvider");
  }
  return context;
};