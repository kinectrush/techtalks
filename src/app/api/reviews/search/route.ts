import { NextResponse } from 'next/server';

import { searchReviewsForTypeaheadAction } from '@/features/review/actions';
import {
  SEARCH_TYPEAHEAD_LIMIT,
  normalizeSearchQuery,
} from '@/lib/search/normalize-query';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') ?? '';
  const query = normalizeSearchQuery(rawQuery);

  if (!query) {
    return NextResponse.json({ data: [], query: rawQuery.trim() });
  }

  const limit = Math.min(
    Number(searchParams.get('limit') ?? SEARCH_TYPEAHEAD_LIMIT),
    SEARCH_TYPEAHEAD_LIMIT,
  );

  const data = await searchReviewsForTypeaheadAction(query);
  const sliced = data.slice(0, limit);

  return NextResponse.json(
    { data: sliced, query },
    {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    },
  );
}
