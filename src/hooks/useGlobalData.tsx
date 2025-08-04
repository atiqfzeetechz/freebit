import {useContext} from 'react';
import {DataContext} from '../context/DataContext';

interface StatsType {
  rewards: string;
  isLotteryDisbaled: boolean;
  tickets: string;
  twoFaStatus: any; // consider replacing 'any' with a specific type like 'string'
}

interface DataContextType {
  stats: StatsType;
  setStats: React.Dispatch<React.SetStateAction<StatsType>>;
  lastSync: String | undefined | null;
  setLastSync: Function;
}
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
