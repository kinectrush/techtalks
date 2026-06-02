import { NextResponse } from 'next/server';

import { loginAction } from '@/features/auth/actions';
import type { LoginPayload } from '@/types/auth';

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const result = await loginAction(body);

  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 401 });
  }

  return NextResponse.json({ user: result.user });
}
