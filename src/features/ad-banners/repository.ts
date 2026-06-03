import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AD_BANNER_PLACEMENTS,
  type AdBannerPlacement,
} from '@/lib/ad-banners/constants';
import type { ActiveAdBannersMap } from '@/types/ad-banner';

type DbActiveBanner = {
  id: string;
  placement: string;
  image_url: string;
  link_url: string | null;
};

export async function fetchActiveAdBanners(
  supabase: SupabaseClient,
): Promise<ActiveAdBannersMap> {
  const { data, error } = await supabase
    .from('ad_banners')
    .select('id, placement, image_url, link_url')
    .eq('is_active', true)
    .in('placement', [...AD_BANNER_PLACEMENTS]);

  if (error) throw error;

  const map: ActiveAdBannersMap = {};
  for (const row of (data ?? []) as DbActiveBanner[]) {
    const placement = row.placement as AdBannerPlacement;
    if (!map[placement]) {
      map[placement] = {
        id: row.id,
        placement,
        imageUrl: row.image_url,
        linkUrl: row.link_url,
      };
    }
  }
  return map;
}
