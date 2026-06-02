import { authApi } from '@/apis/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginPayload } from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await authApi.login(payload);
    useAuthStore.getState().setUser(data.user);
    return data;
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async fetchCurrentUser() {
    const { data } = await authApi.me();
    useAuthStore.getState().setUser(data);
    return data;
  },
};
