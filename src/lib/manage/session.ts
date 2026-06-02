import { cookies } from 'next/headers';

import {
  ADMIN_ACCESS_MAX_AGE,
  ADMIN_AUTH_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_REFRESH_MAX_AGE,
} from '@/lib/manage/constants';
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyAdminToken,
} from '@/lib/manage/jwt';

export type AdminSession = {
  userId: string;
  username: string;
  role: string;
};

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function sessionFromPayload(payload: {
  sub?: string;
  username?: unknown;
  role?: unknown;
}): AdminSession | null {
  if (!payload.sub || payload.username == null || payload.role == null) {
    return null;
  }
  return {
    userId: payload.sub,
    username: String(payload.username),
    role: String(payload.role),
  };
}

export async function setAdminSessionCookies(session: AdminSession) {
  const cookieStore = await cookies();
  const [accessToken, refreshToken] = await Promise.all([
    signAdminAccessToken({
      userId: session.userId,
      username: session.username,
      role: session.role,
    }),
    signAdminRefreshToken({
      userId: session.userId,
      username: session.username,
      role: session.role,
    }),
  ]);

  cookieStore.set(ADMIN_AUTH_COOKIE, accessToken, {
    ...cookieBase,
    maxAge: ADMIN_ACCESS_MAX_AGE,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    ...cookieBase,
    maxAge: ADMIN_REFRESH_MAX_AGE,
  });
}

export async function clearAdminSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_COOKIE);
}

/**
 * Read session from cookies without mutating them.
 * Safe to call from Server Components (e.g. login page, layouts).
 */
export async function readAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (access) {
    const payload = await verifyAdminToken(access, 'admin_access');
    const session = payload ? sessionFromPayload(payload) : null;
    if (session) return session;
  }

  const refresh = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  const refreshPayload = await verifyAdminToken(refresh, 'admin_refresh');
  return refreshPayload ? sessionFromPayload(refreshPayload) : null;
}

/**
 * Resolve session and rotate cookies when only refresh token is valid.
 * Use only in Route Handlers or Server Actions — not during RSC render.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (access) {
    const payload = await verifyAdminToken(access, 'admin_access');
    const session = payload ? sessionFromPayload(payload) : null;
    if (session) return session;
  }

  const session = await readAdminSession();
  if (!session) return null;

  await setAdminSessionCookies(session);
  return session;
}

/** Read-only — safe when invoked during RSC render (e.g. list*Action from pages). */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
