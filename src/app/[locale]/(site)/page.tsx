import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  buildOpenGraphImages,
  getHomeOpenGraphImage,
  localePageUrl,
} from '@/lib/site-assets';
import { HeroBanner } from '@/features/review/components/hero-banner';
import { LatestPostsSection } from '@/features/review/components/latest-posts-section';
import { TrendingSection } from '@/features/review/components/trending-section';
import { TrendingSidebar } from '@/features/review/components/trending-sidebar';
import { getHomePageDataCached } from '@/features/review/actions';
import { routing, type Locale } from '@/i18n/routing';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const localeKey = locale as Locale;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const meta = messages.Metadata;
  const pageUrl = localePageUrl(localeKey);
  const ogImages = buildOpenGraphImages(getHomeOpenGraphImage(localeKey));
  const twitterDescription =
    meta.twitterDescription ?? meta.description;

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
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: twitterDescription,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [data, t] = await Promise.all([
    getHomePageDataCached(),
    getTranslations('Site'),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-10 lg:col-span-8">
          <HeroBanner article={data.hero} locale={locale} />
          <TrendingSection articles={data.trending24h} locale={locale} />
          <LatestPostsSection articles={data.latest} locale={locale} />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <TrendingSidebar articles={data.trending7d} locale={locale} />
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
