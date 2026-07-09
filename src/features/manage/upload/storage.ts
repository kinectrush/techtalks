import { randomUUID } from 'crypto';

import sharp from 'sharp';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseUrl } from '@/lib/supabase/env';
import {
  ALLOWED_IMAGE_TYPES,
  ARTICLE_IMAGES_BUCKET,
  MAX_IMAGE_BYTES,
} from '@/lib/storage/constants';

export type UploadFolder =
  | 'covers'
  | 'og'
  | 'content'
  | 'editor-picks'
  | 'banners';

type OptimizedImage = {
  buffer: Buffer;
  mime: (typeof ALLOWED_IMAGE_TYPES)[number];
};

const WEBP_QUALITY = 82;
const MAX_UPLOAD_DIMENSION: Record<UploadFolder, number> = {
  covers: 1920,
  og: 1200,
  content: 1600,
  'editor-picks': 1920,
  banners: 1920,
};

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] ?? 'bin';
}

async function optimizeImageForStorage(
  file: File,
  folder: UploadFolder,
): Promise<OptimizedImage> {
  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const originalMime = file.type as (typeof ALLOWED_IMAGE_TYPES)[number];

  if (originalMime === 'image/gif') {
    return { buffer: originalBuffer, mime: originalMime };
  }

  const compressedBuffer = await sharp(originalBuffer)
    .rotate()
    .resize({
      width: MAX_UPLOAD_DIMENSION[folder],
      height: MAX_UPLOAD_DIMENSION[folder],
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  if (compressedBuffer.length >= originalBuffer.length) {
    return { buffer: originalBuffer, mime: originalMime };
  }

  return { buffer: compressedBuffer, mime: 'image/webp' };
}

export function getPublicStorageUrl(path: string): string {
  const base = getSupabaseUrl()?.replace(/\/$/, '');
  if (!base) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return `${base}/storage/v1/object/public/${ARTICLE_IMAGES_BUCKET}/${path}`;
}

export async function uploadArticleImage(
  file: File,
  folder: UploadFolder,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error('Định dạng ảnh không hỗ trợ (JPEG, PNG, WebP, GIF)');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ảnh tối đa 5MB');
  }

  const supabase = createSupabaseAdminClient();
  const optimized = await optimizeImageForStorage(file, folder);
  const ext = extFromMime(optimized.mime);
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(ARTICLE_IMAGES_BUCKET)
    .upload(path, optimized.buffer, {
      contentType: optimized.mime,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  return getPublicStorageUrl(path);
}
