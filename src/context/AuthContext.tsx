import React, {createContext, ReactNode, useEffect} from 'react';
import {useMMKVBoolean, useMMKVObject, useMMKVString} from 'react-native-mmkv';
import useAxios from '../hooks/useAxios';
import {useNavigation} from '@react-navigation/native';

interface AuthContextType {
  token: string | undefined;
  setToken: (value: string | undefined) => void;
  setuserDetails: (value: User | undefined) => void;
  userDetails: User | undefined;
  isLoggedIn: boolean | undefined;
  setIsLoggedIn: Function;
  login: Function;
  logout: Function;
  credentials: credentials | undefined;
  setCredentials: Function;
  isFreeBtcLoggedIn: boolean | undefined;
  setIsFreeBtcLoggedIn: Function;
  loginType:string | undefined;
 setLoginType:Function
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}
type User = {
  emailSubscriptions: {
    paymentNotifications: boolean;
    depositNotifications: boolean;
    adAccountNotifications: boolean;
    promotions: boolean;
  };
  email: string;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  referralCount: number;
  createdAt: string;
  updatedAt: string;
  referralCode: string;
  id: string;
  profileImage?:string
};

interface credentials {
  email: string;
  password: string;
  FA2?:string
}

export const AuthProvider = ({children}: Props) => {
  const [token, setToken] = useMMKVString('token');
  const [loginType, setLoginType] = useMMKVString('loginType');
  const [userDetails, setuserDetails] = useMMKVObject<User>('user');
  const [credentials, setCredentials] =
    useMMKVObject<credentials>('credentials');
  const [isLoggedIn, setIsLoggedIn] = useMMKVBoolean('isLogged');
  const [isFreeBtcLoggedIn, setIsFreeBtcLoggedIn] =
    useMMKVBoolean('isFreeBtcLoggedIn');
  console.log({userDetails});

  const login = (
    token: string,
    cradentials: credentials,
    loginType: string,
  ) => {
    setLoginType(loginType);
    setCredentials({
      email: cradentials.email,
      password: cradentials.password,
      FA2:cradentials.FA2
    });
    setToken(token);
    setIsLoggedIn(true);
    console.log(cradentials);
  };

  const logout = () => {
    setToken('');
    setIsLoggedIn(false);
    setLoginType(undefined);
    setuserDetails(undefined)
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userDetails,
        setuserDetails,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        credentials,
        setCredentials,
        loginType, setLoginType
      }}>
      {children}
    </AuthContext.Provider>
  );
};
