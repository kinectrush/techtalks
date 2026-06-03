import { unstable_cache } from 'next/cache';

import { fetchActiveAdBanners } from '@/features/ad-banners/repository';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';
import type { ActiveAdBannersMap } from '@/types/ad-banner';

async function loadActiveAdBanners(): Promise<ActiveAdBannersMap> {
  const supabase = createSupabasePublicClientIfConfigured();
  if (!supabase) return {};
  try {
    return await fetchActiveAdBanners(supabase);
  } catch (error) {
    console.error('[ad-banners] fetch failed', error);
    return {};
  }
}

export const getActiveAdBannersCached = unstable_cache(
  loadActiveAdBanners,
  ['active-ad-banners'],
  { revalidate: 60, tags: ['ad-banners'] },
);
