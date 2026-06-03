import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { ReviewDetailView } from '@/features/review/components/review-detail-view';
import { getPublishedReviewBySlug } from '@/features/review/queries/get-published-review-by-slug';
import type { Locale } from '@/i18n/routing';
import { buildReviewDetailMetadata } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ReviewDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const article = await getPublishedReviewBySlug(slug);
    if (!article) return {};

    return buildReviewDetailMetadata(article, locale as Locale);
  } catch (error) {
    console.error('[review/generateMetadata]', error);
    return {};
  }
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const article = await getPublishedReviewBySlug(slug);

  if (!article) notFound();

  return <ReviewDetailView article={article} locale={locale} />;
}
