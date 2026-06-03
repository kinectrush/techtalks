import { BannersManager } from '@/features/manage/components/banners-manager';
import { listBannersAction } from '@/features/manage/banners/actions';

export default async function AdminBannersPage() {
  const banners = await listBannersAction();

  return <BannersManager initialBanners={banners} />;
}
