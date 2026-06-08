import { unstable_cache } from 'next/cache';

import { fetchWorldCupLiveData } from '@/lib/football-data/fetch-world-cup';
import type { FeaturedSubcategory, HomePageData } from '@/types/review';
import type {
  FeaturedMatchTicker,
  SubcategoryHomepageConfig,
} from '@/types/world-cup';

export const getWorldCupLiveDataCached = unstable_cache(
  async () => fetchWorldCupLiveData(),
  ['world-cup-football-data-v3'],
  { revalidate: 120, tags: ['world-cup'] },
);

function applyLiveDataToConfig(
  config: SubcategoryHomepageConfig,
  live: NonNullable<Awaited<ReturnType<typeof fetchWorldCupLiveData>>>,
): SubcategoryHomepageConfig {
  return {
    matches: live.matches.length ? live.matches : config.matches,
    groupStandings: live.groupStandings.length
      ? live.groupStandings
      : config.groupStandings,
  };
}

function enrichFeaturedSubcategories(
  featured: FeaturedSubcategory[],
  live: NonNullable<Awaited<ReturnType<typeof fetchWorldCupLiveData>>>,
): FeaturedSubcategory[] {
  return featured.map((item) => ({
    ...item,
    homepageConfig: applyLiveDataToConfig(item.homepageConfig, live),
  }));
}

export async function enrichHomePageWithWorldCupData(
  data: HomePageData,
): Promise<HomePageData> {
  if (!data.featuredSubcategories.length) return data;

  const live = await getWorldCupLiveDataCached();
  if (!live) return data;

  return {
    ...data,
    featuredSubcategories: enrichFeaturedSubcategories(
      data.featuredSubcategories,
      live,
    ),
  };
}

export async function resolveFeaturedMatchTicker(
  data: HomePageData,
): Promise<FeaturedMatchTicker> {
  if (!data.featuredSubcategories.length) {
    return { matches: [], accentColor: null };
  }

  const live = await getWorldCupLiveDataCached();

  if (live?.matches.length) {
    return {
      matches: live.matches,
      accentColor: data.featuredSubcategories[0]?.accentColor ?? null,
    };
  }

  const merged = data.featuredSubcategories.flatMap(
    (featured) => featured.homepageConfig.matches ?? [],
  );

  return {
    matches: merged,
    accentColor: data.featuredSubcategories[0]?.accentColor ?? null,
  };
}
