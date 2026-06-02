import { NextResponse } from 'next/server';

import { adminLogoutAction } from '@/features/manage/auth/actions';

export async function POST() {
  await adminLogoutAction();
  return NextResponse.json({ success: true });
}
