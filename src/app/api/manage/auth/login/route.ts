import { NextResponse } from 'next/server';

import { adminLoginAction } from '@/features/manage/auth/actions';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!body.username?.trim() || !body.password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 },
    );
  }

  const result = await adminLoginAction({
    username: body.username,
    password: body.password,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ user: result.user });
}
