import { randomUUID } from 'crypto';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseUrl } from '@/lib/supabase/env';
import {
  ALLOWED_IMAGE_TYPES,
  ARTICLE_IMAGES_BUCKET,
  MAX_IMAGE_BYTES,
} from '@/lib/storage/constants';

export type UploadFolder = 'covers' | 'og' | 'content';

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] ?? 'bin';
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
  const ext = extFromMime(file.type);
  const path = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(ARTICLE_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  return getPublicStorageUrl(path);
}
