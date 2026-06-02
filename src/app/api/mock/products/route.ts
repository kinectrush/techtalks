import { NextResponse } from 'next/server';

import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/product';

const MOCK: Product[] = [
  { id: '1', name: 'SWR Product A', price: 19.99 },
  { id: '2', name: 'SWR Product B', price: 39.99 },
  { id: '3', name: 'SWR Product C', price: 59.99 },
];

export async function GET() {
  const body: PaginatedResponse<Product> = {
    data: MOCK,
    total: MOCK.length,
    page: 1,
    pageSize: 10,
  };
  return NextResponse.json(body);
}
