import { NextResponse } from 'next/server';

import {
  getReviewsListPaginatedAction,
  searchReviewsPaginatedAction,
} from '@/features/review/actions';
import { parseReviewsPage } from '@/lib/reviews/constants';
import { normalizeSearchQuery } from '@/lib/search/normalize-query';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseReviewsPage(searchParams.get('page') ?? undefined);
  const categorySlug = searchParams.get('category') ?? undefined;
  const searchQuery = normalizeSearchQuery(searchParams.get('q') ?? '') ?? undefined;

  const result = searchQuery
    ? await searchReviewsPaginatedAction(searchQuery, { categorySlug, page })
    : await getReviewsListPaginatedAction({ categorySlug, page });

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
