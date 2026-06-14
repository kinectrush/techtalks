import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getActiveAdBannersCached } from '@/features/ad-banners/actions';
import { AdBannerSlot } from '@/features/ad-banners/components/ad-banner-slot';
import { ReviewsCategoryFilter } from '@/features/review/components/reviews-category-filter';
import {
  getCategoryLabelCached,
  getReviewsCategoryContextCached,
  getReviewsListPaginatedCached,
  searchReviewsPaginatedCached,
} from '@/features/review/actions';
import { ReviewsInfiniteList } from '@/features/review/components/reviews-infinite-list';
import { normalizeSearchQuery } from '@/lib/search/normalize-query';
import { resolveReviewsListCategorySlug } from '@/lib/reviews/resolve-list-category-slug';
import {
  buildOpenGraphImages,
  getReviewsOpenGraphImage,
  reviewsListPageUrl,
} from '@/lib/site-assets';

const locale = 'vi' as const;

type ReviewsPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
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
      locale: 'vi_VN',
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
  searchParams,
}: ReviewsPageProps): Promise<Metadata> {
  const { category: categorySlug } = await searchParams;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const ogImages = buildOpenGraphImages(getReviewsOpenGraphImage(categorySlug));
  const pageUrl = reviewsListPageUrl(locale, categorySlug);

  if (categorySlug && categorySlug in CATEGORY_SEO_KEYS) {
    const metaKey =
      CATEGORY_SEO_KEYS[categorySlug as keyof typeof CATEGORY_SEO_KEYS];
    const meta = messages.Review.categoryMeta[metaKey];
    return buildCategoryReviewsMetadata(meta, pageUrl, ogImages);
  }

  const reviewT = await getTranslations({
    locale,
    namespace: 'Review',
  });
  const siteT = await getTranslations({
    locale,
    namespace: 'Site',
  });

  let heading = reviewT('allReviews');
  if (categorySlug) {
    const label = await getCategoryLabelCached(categorySlug);
    if (label) heading = label.name;
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
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  setRequestLocale(locale);
  const { category: categorySlug, q: rawQuery } = await searchParams;
  const searchQuery = normalizeSearchQuery(rawQuery ?? '') ?? undefined;

  const categoryContext =
    categorySlug && !searchQuery
      ? await getReviewsCategoryContextCached(categorySlug)
      : null;
  const listCategorySlug = resolveReviewsListCategorySlug(
    categorySlug,
    categoryContext,
  );

  const [listResult, categoryLabel, t, adBanners] = await Promise.all([
    searchQuery
      ? searchReviewsPaginatedCached(searchQuery, listCategorySlug, 1)
      : getReviewsListPaginatedCached(listCategorySlug, 1),
    categorySlug ? getCategoryLabelCached(categorySlug) : Promise.resolve(null),
    getTranslations('Review'),
    getActiveAdBannersCached(),
  ]);

  const articles = listResult.data;

  const reviewsBanner = adBanners.reviews;

  const activeCategory = categoryLabel
    ? { slug: categoryLabel.slug, name: categoryLabel.name }
    : undefined;

  const pageTitle = searchQuery
    ? t('searchResultsFor', { query: searchQuery })
    : categoryContext && categoryContext.isParentAll
      ? categoryContext.parent.name
      : activeCategory
        ? activeCategory.name
        : t('allReviews');

  const emptyMessage = searchQuery
    ? t('noSearchResults')
    : t('noReviews');

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
        <p className="mb-6 text-sm text-muted-foreground">{t('unknownCategory')}</p>
      ) : null}

      {!searchQuery && categoryContext && categoryContext.subcategories.length > 0 ? (
        <ReviewsCategoryFilter
          parentCategory={categoryContext.parent}
          subcategories={categoryContext.subcategories}
          activeSubSlug={
            categoryContext.isParentAll ? undefined : categorySlug
          }
        />
      ) : null}

      {articles.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ReviewsInfiniteList
          key={`${listCategorySlug ?? ''}-${searchQuery ?? ''}`}
          initialItems={articles}
          initialPage={listResult.page}
          total={listResult.total}
          pageSize={listResult.pageSize}
          locale={locale}
          categorySlug={listCategorySlug}
          searchQuery={searchQuery}
          labels={{
            hotLabel: t('badgeHot'),
            newLabel: t('badgeNew'),
            trendingLabel: t('badgeTrending'),
          }}
        />
      )}
    </main>
  );
}

