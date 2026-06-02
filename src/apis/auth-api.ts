import { axiosClient } from '@/lib/axios-client';
import type { LoginPayload, LoginResponse, User } from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<LoginResponse>('/auth/login', payload),

  logout: () => axiosClient.post('/auth/logout'),

  me: () => axiosClient.get<User>('/users/me'),

  refresh: () => axiosClient.post('/auth/refresh'),
};
