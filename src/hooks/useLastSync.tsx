import { useState, useEffect } from "react";
import { useData } from "./useGlobalData";

const formatLastSync = (syncTime: string | null | undefined) => {
  if (!syncTime) return "Never synced";
  
  const lastSync = new Date(syncTime);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const remainingSeconds = diffInSeconds % 60;
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    const remainingMinutes = diffInMinutes % 60;
    return `${diffInHours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export function useLastSyncDisplay() {
     const {stats, setStats, lastSync, setLastSync} = useData();
  const [lastSyncDisplay, setLastSyncDisplay] = useState(() => formatLastSync(lastSync));

  useEffect(() => {
    const update = () => {
      setLastSyncDisplay(formatLastSync(lastSync));
    };

    update(); // Initial update
    
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return lastSyncDisplay;
}
