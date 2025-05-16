import {useState} from 'react';
import axios, {AxiosRequestConfig, AxiosError} from 'axios';
import {showNotification} from '../utils/Notify';
import { useAuth } from './useAuth';

interface FetchDataProps {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
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

export default function useAxios() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<errorRes>();
  const {token}=useAuth()


  const instance = axios.create({
    baseURL: 'https://backend.freebit.fzeetechz.com/api/v1',
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
  }: FetchDataProps): Promise<AxiosResponse<T> | undefined> => {
    setIsLoading(true);
    setError(null);

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
    };

    try {
      const response = await instance.request<T>(config);
      setIsLoading(false);
console.log(response)
        console.log(response.data);
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

      setIsLoading(false);

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
    }
  };

  return {fetchData, isLoading, error};
}
