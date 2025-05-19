import {useState} from 'react';
import axios, {AxiosRequestConfig, AxiosError} from 'axios';
import {showNotification} from '../utils/Notify';
import {useAuth} from './useAuth';
import {useLoader} from './useLoader';

interface FetchDataProps {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  headers?:any
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


export const baseUrl =`https://backend.freebit.fzeetechz.com/api/v1`;
export const imgUrl = `https://backend.freebit.fzeetechz.com`

export default function useAxios() {
  const [error, setError] = useState<errorRes>();
  const {token} = useAuth();
  const {showLoader, hideLoader} = useLoader();

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
    headers = {}
  }: FetchDataProps): Promise<AxiosResponse<T> | undefined> => {
    setError(null);
    showLoader();

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      headers
    };

    try {
      const response = await instance.request<T>(config);

      showNotification(response?.data?.message, 'success');

      return {
        data: response.data,
        status: response.status,
        statusText: response?.data?.message | '',
      };
    } catch (err) {
      const axiosError = err as AxiosError;

      setError({
        statusCode: axiosError.status,
        status: false,
        message: axiosError.response?.data?.message,
        errors: axiosError.response?.data?.errors,
      });

      // Return undefined or throw error based on your needs
      const messages = axiosError.response?.data?.errors;
      if (messages?.length) {
        messages?.map((m: any) => {
          showNotification(m.message, 'error');
        });
      }
      return {
        statusCode: axiosError.status,
        status: false,
        message: axiosError.response?.data?.message,
        error: axiosError.response?.data?.errors,
      };
    } finally {
      hideLoader();
    }
  };

  return {fetchData, error};
}
