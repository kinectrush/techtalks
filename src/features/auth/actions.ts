'use server';

import { cookies } from 'next/headers';

import { AUTH_COOKIE, REFRESH_COOKIE } from '@/lib/constants';
import type { LoginPayload, User } from '@/types/auth';

const DEMO_USER: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
};

export async function loginAction(payload: LoginPayload) {
  if (
    payload.email !== 'demo@example.com' ||
    payload.password !== 'password'
  ) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  const cookieStore = await cookies();
  const accessToken = `demo-access-${Date.now()}`;
  const refreshToken = `demo-refresh-${Date.now()}`;

  cookieStore.set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true as const, user: DEMO_USER };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  return { success: true as const };
}
