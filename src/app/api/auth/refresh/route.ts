import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE, REFRESH_COOKIE } from '@/lib/constants';

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  const accessToken = `demo-access-refreshed-${Date.now()}`;
  cookieStore.set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return NextResponse.json({ success: true });
}
