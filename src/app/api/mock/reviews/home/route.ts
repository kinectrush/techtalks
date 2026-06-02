import { NextResponse } from 'next/server';

import { getHomePageData } from '@/features/review/lib/review-repository';

export async function GET() {
  return NextResponse.json(getHomePageData());
}
