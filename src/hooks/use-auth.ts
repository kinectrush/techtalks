'use client';

import useSWR from 'swr';

import { swrKeys } from '@/swr/keys';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/auth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const { isLoading, mutate } = useSWR<User>(
    isAuthenticated ? swrKeys.currentUser : null,
    {
      onSuccess: (data) => setUser(data),
      onError: () => logout(),
    },
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refresh: mutate,
  };
}
