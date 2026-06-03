import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getReviewBySlugCached } from '@/features/review/actions';
import { ReviewDetailView } from '@/features/review/components/review-detail-view';
import type { Locale } from '@/i18n/routing';
import { buildReviewDetailMetadata } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';

type ReviewDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getReviewBySlugCached(slug);
  if (!article) return {};

  return buildReviewDetailMetadata(article, locale as Locale);
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const article = await getReviewBySlugCached(slug);

  if (!article) notFound();

  return <ReviewDetailView article={article} locale={locale} />;
}
