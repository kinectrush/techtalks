import { redirect } from 'next/navigation';

import { ADMIN_ARTICLES_PATH } from '@/lib/manage/constants';

export default function AdminDashboardIndexPage() {
  redirect(ADMIN_ARTICLES_PATH);
}
