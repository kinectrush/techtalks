import type { UploadFolder } from '@/features/manage/upload/storage';

export async function uploadImageClient(
  file: File,
  folder: UploadFolder,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/manage/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? 'Upload failed');
  }
  return data.url;
}
