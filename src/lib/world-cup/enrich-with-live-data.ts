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

function emptyHomepageConfig(): SubcategoryHomepageConfig {
  return { matches: [], groupStandings: [] };
}

function applyLiveDataToConfig(
  live: NonNullable<Awaited<ReturnType<typeof fetchWorldCupLiveData>>>,
): SubcategoryHomepageConfig {
  return {
    matches: live.matches,
    groupStandings: live.groupStandings,
  };
}

export function stripWorldCupLiveData(data: HomePageData): HomePageData {
  return {
    ...data,
    featuredSubcategories: data.featuredSubcategories.map((item) => ({
      ...item,
      homepageConfig: emptyHomepageConfig(),
    })),
  };
}

function enrichFeaturedSubcategories(
  featured: FeaturedSubcategory[],
  live: NonNullable<Awaited<ReturnType<typeof fetchWorldCupLiveData>>>,
): FeaturedSubcategory[] {
  return featured.map((item) => ({
    ...item,
    homepageConfig: applyLiveDataToConfig(live),
  }));
}

export async function enrichHomePageWithWorldCupData(
  data: HomePageData,
): Promise<HomePageData> {
  if (!data.featuredSubcategories.length) return data;

  const live = await getWorldCupLiveDataCached();
  if (!live) return stripWorldCupLiveData(data);

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

  if (!live?.matches.length) {
    return { matches: [], accentColor: null };
  }

  return {
    matches: live.matches,
    accentColor: data.featuredSubcategories[0]?.accentColor ?? null,
  };
}
