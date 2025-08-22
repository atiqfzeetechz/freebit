import { useState } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { showNotification } from '../utils/Notify';
import { useAuth } from './useAuth';
import { useLoader } from './useLoader';
import { useWebView } from '../context/WebviewContext';

interface FetchDataProps {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  headers?: any;
  loader?: boolean;
}

interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

interface errorRes<T = any> {
  message: string;
  status?: false;
  statusCode: number | undefined;
  errors: {
    message: string | '';
  }[];
}

export const baseUrl = `https://backend.freebit.fzeetechz.com/api/v1`;
// export const baseUrl = `http://192.168.1.46:5013/api/v1`;
export const imgUrl = `https://backend.freebit.fzeetechz.com`;

export default function useAxios() {
  const [error, setError] = useState<errorRes>();
  const [loading, setLoading] = useState<boolean>(false); // ✅ new loading state

  const { token,logout } = useAuth();
  const { showLoader, hideLoader } = useLoader();
    const {
      shouldLogout,
      clearLogoutFlag,
      SyncWebViewClick,
      setSyncWebViewclick,
      triggerLogout
    } = useWebView();

  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchData = async <T = any,>({
    url,
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    loader = false,
  }: FetchDataProps): Promise<AxiosResponse<T> | undefined> => {
    console.log(`${baseUrl}${url}`, method);
    setError(null);
    setLoading(true); // ✅ start loading

    if (loader) {
      showLoader();
    }

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      headers,
    };

    try {
      const response = await instance.request<T>(config);

      return {
        data: response.data,
        status: response.status,
        statusText: response?.data?.message || '',
      };
    } catch (err) {
      const axiosError = err as AxiosError;
      const errobj = {
        statusCode: axiosError.status,
        status: false,
        message: (axiosError.response?.data as any)?.message,
        errors: (axiosError.response?.data as any)?.errors,
      };

      console.log(errobj);

      setError(errobj);

      if (errobj.statusCode == 403) {
        showNotification('Please Login Again', 'error');
        triggerLogout()
        logout()
        return;
      }

      const messages = (axiosError.response?.data as any)?.errors;
      if (messages?.length) {
        messages.forEach((m: any) => {
          showNotification(m.message, 'error');
        });
      }

      return undefined;
    } finally {
      setLoading(false); // ✅ stop loading
      hideLoader();
    }
  };

  return { fetchData, error, setError, loading }; // ✅ return loading
}
