import { NextResponse } from 'next/server';

import { getTrendingAction } from '@/features/review/actions';
import type { TrendingWindow } from '@/types/review';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const window = (searchParams.get('window') ?? '24h') as TrendingWindow;
  const limit = Number(searchParams.get('limit') ?? 10);

  const data = await getTrendingAction(
    window === '7d' ? '7d' : '24h',
    limit,
  );

  return NextResponse.json({ data, window });
}
