import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getActiveAdBannersCached } from '@/features/ad-banners/actions';
import { AdBannerSlot } from '@/features/ad-banners/components/ad-banner-slot';
import {
  getPublicCategoriesAction,
  getReviewsListCached,
} from '@/features/review/actions';
import { filterPublicCategories } from '@/lib/category/constants';
import {
  buildOpenGraphImages,
  getReviewsOpenGraphImage,
  reviewsListPageUrl,
} from '@/lib/site-assets';
import { ReviewCard } from '@/features/review/components/review-card';
import { ReviewsCategoryFilter } from '@/features/review/components/reviews-category-filter';
import { routing, type Locale } from '@/i18n/routing';

type ReviewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

type CategorySeoCopy = {
  title: string;
  description: string;
  ogDescription: string;
};

const CATEGORY_SEO_KEYS = {
  'cong-nghe': 'congNghe',
  'the-thao': 'theThao',
} as const satisfies Record<string, 'congNghe' | 'theThao'>;

function buildCategoryReviewsMetadata(
  meta: CategorySeoCopy,
  pageUrl: string,
  ogImages: ReturnType<typeof buildOpenGraphImages>,
  locale: string,
): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: meta.title,
      description: meta.ogDescription,
      siteName: 'TechTalks',
      images: ogImages,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.ogDescription,
      images: ogImages.map((img) => img.url),
    },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: ReviewsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { category: categorySlug } = await searchParams;
  const localeKey = locale as Locale;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const ogImages = buildOpenGraphImages(
    getReviewsOpenGraphImage(categorySlug),
  );
  const pageUrl = reviewsListPageUrl(localeKey, categorySlug);

  if (
    categorySlug &&
    categorySlug in CATEGORY_SEO_KEYS
  ) {
    const metaKey =
      CATEGORY_SEO_KEYS[categorySlug as keyof typeof CATEGORY_SEO_KEYS];
    const meta = messages.Review.categoryMeta[metaKey];
    return buildCategoryReviewsMetadata(meta, pageUrl, ogImages, locale);
  }

  const reviewT = await getTranslations({
    locale: localeKey,
    namespace: 'Review',
  });
  const siteT = await getTranslations({
    locale: localeKey,
    namespace: 'Site',
  });

  let heading = reviewT('allReviews');
  if (categorySlug) {
    const categories = filterPublicCategories(
      await getPublicCategoriesAction(),
    );
    const match = categories.find((c) => c.slug === categorySlug);
    if (match) heading = match.name;
  }

  const pageTitle = `${heading} | ${siteT('siteName')}`;
  const description = messages.Metadata.description;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: pageTitle,
      description,
      siteName: 'TechTalks',
      images: ogImages,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function ReviewsPage({
  params,
  searchParams,
}: ReviewsPageProps) {
  const { locale } = await params;
  const { category: categorySlug } = await searchParams;
  setRequestLocale(locale as Locale);

  const [articles, categories, t, adBanners] = await Promise.all([
    getReviewsListCached(categorySlug),
    getPublicCategoriesAction(),
    getTranslations('Review'),
    getActiveAdBannersCached(),
  ]);

  const reviewsBanner = adBanners.reviews;

  const publicCategories = filterPublicCategories(categories);

  const activeCategory = categorySlug
    ? publicCategories.find((c) => c.slug === categorySlug)
    : undefined;

  const pageTitle = activeCategory ? activeCategory.name : t('allReviews');

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {reviewsBanner ? (
        <div className="mb-6">
          <AdBannerSlot
            imageUrl={reviewsBanner.imageUrl}
            linkUrl={reviewsBanner.linkUrl}
            aspectRatio="16/9"
            priority
          />
        </div>
      ) : null}
      <h1 className="mb-2 text-3xl font-bold">{pageTitle}</h1>
      {categorySlug && !activeCategory ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {t('unknownCategory')}
        </p>
      ) : null}

      <ReviewsCategoryFilter
        categories={publicCategories}
        activeSlug={categorySlug}
      />

      {articles.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
          {t('noReviews')}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ReviewCard
              key={article.id}
              article={article}
              locale={locale}
              hotLabel={t('badgeHot')}
              newLabel={t('badgeNew')}
              trendingLabel={t('badgeTrending')}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
