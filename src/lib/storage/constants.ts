export const ARTICLE_IMAGES_BUCKET = 'article-images';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
