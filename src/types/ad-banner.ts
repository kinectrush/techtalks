import type { AdBannerPlacement } from '@/lib/ad-banners/constants';

export type AdBanner = {
  id: string;
  placement: AdBannerPlacement;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdBannerInput = {
  placement: AdBannerPlacement;
  name: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
};

export type ActiveAdBannersMap = Partial<
  Record<AdBannerPlacement, Pick<AdBanner, 'id' | 'placement' | 'imageUrl' | 'linkUrl'>>
>;
