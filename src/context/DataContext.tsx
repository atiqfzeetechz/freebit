import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StatsType {
  rewards: string;
  isLotteryDisbaled: boolean;
  tickets: string;
  twoFaStatus: any; // consider replacing 'any' with a specific type like 'string'
}

interface DataContextType {
  stats: StatsType;
  setStats: React.Dispatch<React.SetStateAction<StatsType>>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<StatsType>({
    rewards: '0',
    isLotteryDisbaled:false,
    tickets:'0',
    twoFaStatus:''
  });

  return (
    <DataContext.Provider value={{ stats, setStats }}>
      {children}
    </DataContext.Provider>
  );
};
