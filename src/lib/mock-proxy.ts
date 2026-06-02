import { NextResponse } from 'next/server';

import {
  getPublishedReviewsForClientAction,
  getHomePageDataCached,
  getTrendingAction,
} from '@/features/review/actions';
import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/product';
import type { ReviewSummary } from '@/types/review';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'SWR Product A', price: 19.99 },
  { id: '2', name: 'SWR Product B', price: 39.99 },
  { id: '3', name: 'SWR Product C', price: 59.99 },
];

export async function handleMockProxy(
  pathSegments: string[],
  method: string,
  authorization?: string,
) {
  const path = pathSegments.join('/');

  if (method === 'GET' && path === 'reviews/home') {
    return NextResponse.json(await getHomePageDataCached());
  }

  if (method === 'GET' && path === 'reviews/trending') {
    return NextResponse.json({ data: await getTrendingAction('24h', 10), window: '24h' });
  }

  if (method === 'GET' && path === 'reviews') {
    const reviews = await getPublishedReviewsForClientAction();
    const body: PaginatedResponse<ReviewSummary> = {
      data: reviews,
      total: reviews.length,
      page: 1,
      pageSize: reviews.length,
    };
    return NextResponse.json(body);
  }

  if (method === 'GET' && path === 'products') {
    const body: PaginatedResponse<Product> = {
      data: MOCK_PRODUCTS,
      total: MOCK_PRODUCTS.length,
      page: 1,
      pageSize: 10,
    };
    return NextResponse.json(body);
  }

  if (method === 'GET' && path === 'users/me') {
    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
    });
  }

  if (method === 'POST' && path === 'auth/login') {
    return NextResponse.json({
      accessToken: 'mock',
      refreshToken: 'mock',
      user: {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });
  }

  if (method === 'POST' && path === 'auth/logout') {
    return NextResponse.json({ success: true });
  }

  if (method === 'POST' && path === 'auth/refresh') {
    return NextResponse.json({ accessToken: `refreshed-${Date.now()}` });
  }

  return null;
}
