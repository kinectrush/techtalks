import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { ReviewDetailView } from '@/features/review/components/review-detail-view';
import {
  getPublishedReviewBySlug,
  isDraftPreviewView,
} from '@/features/review/queries/get-published-review-by-slug';
import type { Locale } from '@/i18n/routing';
import { buildReviewDetailMetadata } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ReviewDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: ReviewDetailPageProps): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const { view } = await searchParams;
    const draftPreview = isDraftPreviewView(view);
    const article = await getPublishedReviewBySlug(slug, draftPreview);
    if (!article) return {};

    const metadata = buildReviewDetailMetadata(article, locale as Locale);
    if (draftPreview) {
      return {
        ...metadata,
        robots: { index: false, follow: false },
      };
    }
    return metadata;
  } catch (error) {
    console.error('[review/generateMetadata]', error);
    return {};
  }
}

export default async function ReviewDetailPage({
  params,
  searchParams,
}: ReviewDetailPageProps) {
  const { locale, slug } = await params;
  const { view } = await searchParams;
  const draftPreview = isDraftPreviewView(view);
  setRequestLocale(locale as Locale);
  const article = await getPublishedReviewBySlug(slug, draftPreview);

  if (!article) notFound();

  return (
    <ReviewDetailView
      article={article}
      locale={locale}
      isDraftPreview={draftPreview}
    />
  );
}
