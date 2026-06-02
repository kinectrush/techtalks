'use client';

import useSWR from 'swr';

import { swrKeys } from '@/swr/keys';
import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/product';

export function useProducts() {
  return useSWR<PaginatedResponse<Product>>(swrKeys.products);
}
