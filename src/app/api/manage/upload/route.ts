import { NextResponse } from 'next/server';

import { getAdminSession } from '@/lib/manage/session';
import {
  uploadArticleImage,
  type UploadFolder,
} from '@/features/manage/upload/storage';

const FOLDERS: UploadFolder[] = [
  'covers',
  'og',
  'content',
  'editor-picks',
  'banners',
];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') as UploadFolder | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    if (!folder || !FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }

    const url = await uploadArticleImage(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
