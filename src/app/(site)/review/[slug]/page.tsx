import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getReviewBySlugCached } from '@/features/review/actions';
import { ReviewDetailView } from '@/features/review/components/review-detail-view';
import { buildReviewDetailMetadata } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';

const locale = 'vi' as const;

type ReviewDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getReviewBySlugCached(slug);
  if (!article) return {};

  return buildReviewDetailMetadata(article, locale);
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  setRequestLocale(locale);
  const { slug } = await params;
  const article = await getReviewBySlugCached(slug);

  if (!article) notFound();

  return <ReviewDetailView article={article} locale={locale} />;
}

