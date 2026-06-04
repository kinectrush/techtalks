export type ArticleDetailAdBanner = {
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
};

export type ArticleDetailAdBannerInput = {
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
};

type DbArticleDetailAdBanner = {
  image_url: string;
  link_url?: string | null;
  is_active?: boolean;
};

export function mapDbArticleDetailBanner(
  raw: unknown,
): ArticleDetailAdBanner | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as DbArticleDetailAdBanner;
  const imageUrl =
    typeof row.image_url === 'string' ? row.image_url.trim() : '';
  if (!imageUrl) return null;
  return {
    imageUrl,
    linkUrl:
      typeof row.link_url === 'string' && row.link_url.trim()
        ? row.link_url.trim()
        : null,
    isActive: row.is_active !== false,
  };
}

export function toDbArticleDetailBanner(
  input: ArticleDetailAdBannerInput | ArticleDetailAdBanner | null | undefined,
): DbArticleDetailAdBanner | null {
  const imageUrl = input?.imageUrl?.trim();
  if (!imageUrl) return null;
  return {
    image_url: imageUrl,
    link_url: input?.linkUrl?.trim() || null,
    is_active: input?.isActive ?? true,
  };
}

/** Banner shown on the public review detail page. */
export function activeArticleDetailBanner(
  banner: ArticleDetailAdBanner | null | undefined,
): Pick<ArticleDetailAdBanner, 'imageUrl' | 'linkUrl'> | null {
  if (!banner?.isActive || !banner.imageUrl) return null;
  return { imageUrl: banner.imageUrl, linkUrl: banner.linkUrl };
}
