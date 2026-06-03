import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getActiveAdBannersCached } from '@/features/ad-banners/actions';
import { AdBannerSlot } from '@/features/ad-banners/components/ad-banner-slot';
import { getHomePageDataCached } from '@/features/review/actions';
import { HomeEmptyState } from '@/features/review/components/home-empty-state';
import { HeroBanner } from '@/features/review/components/hero-banner';
import { LatestPostsSection } from '@/features/review/components/latest-posts-section';
import { TrendingSection } from '@/features/review/components/trending-section';
import { TrendingSidebar } from '@/features/review/components/trending-sidebar';
import {
  buildOpenGraphImages,
  getHomeOpenGraphImage,
  localePageUrl,
} from '@/lib/site-assets';

const locale = 'vi' as const;

export async function generateMetadata(): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const meta = messages.Metadata;
  const pageUrl = localePageUrl(locale);
  const ogImages = buildOpenGraphImages(getHomeOpenGraphImage(locale));
  const twitterDescription = meta.twitterDescription ?? meta.description;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: meta.title,
      description: meta.description,
      siteName: 'TechTalks',
      images: ogImages,
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: twitterDescription,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function HomePage() {
  setRequestLocale(locale);

  const [data, adBanners] = await Promise.all([
    getHomePageDataCached(),
    getActiveAdBannersCached(),
  ]);

  const hasArticles = Boolean(data.hero);
  const homeMobileBanner = adBanners.home_mobile;
  const homeDesktopBanner = adBanners.home_desktop;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      {homeMobileBanner ? (
        <div className="mb-6 lg:hidden">
          <AdBannerSlot
            imageUrl={homeMobileBanner.imageUrl}
            linkUrl={homeMobileBanner.linkUrl}
            aspectRatio="16/9"
            priority
          />
        </div>
      ) : null}
      {hasArticles ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-10 lg:col-span-8">
            {data.hero ? (
              <HeroBanner article={data.hero} locale={locale} />
            ) : null}
            <TrendingSection articles={data.trending24h} locale={locale} />
            <LatestPostsSection articles={data.latest} locale={locale} />
          </div>

          <div className="space-y-6 lg:col-span-4">
            <TrendingSidebar articles={data.trending7d} locale={locale} />
            {homeDesktopBanner ? (
              <div className="hidden lg:block">
                <AdBannerSlot
                  imageUrl={homeDesktopBanner.imageUrl}
                  linkUrl={homeDesktopBanner.linkUrl}
                  aspectRatio="9/16"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <HomeEmptyState />
      )}
    </main>
  );
}

