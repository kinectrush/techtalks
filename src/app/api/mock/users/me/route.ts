import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE } from '@/lib/constants';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
  });
}
