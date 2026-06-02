'use client';

import useSWR from 'swr';

import { swrKeys } from '@/swr/keys';
import type { PaginatedResponse } from '@/types/api';
import type { ReviewSummary } from '@/types/review';

export function useReviews() {
  return useSWR<PaginatedResponse<ReviewSummary>>(swrKeys.reviews);
}
