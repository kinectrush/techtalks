import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_PROXY_PREFIX } from '@/lib/constants';

export const axiosClient = axios.create({
  baseURL: API_PROXY_PREFIX,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return axiosClient(original);
      } catch {
        window.location.href = '/manage/admin/login';
      }
    }

    return Promise.reject(error);
  },
);
