import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ReviewDetailView } from '@/features/review/components/review-detail-view';
import { getReviewBySlugCached } from '@/features/review/actions';
import { routing, type Locale } from '@/i18n/routing';

type ReviewDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getReviewBySlugCached(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const article = await getReviewBySlugCached(slug);

  if (!article) notFound();

  return <ReviewDetailView article={article} locale={locale} />;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
