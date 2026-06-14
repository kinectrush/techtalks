import { BannersManager } from '@/features/manage/components/banners-manager';
import { listBannersAction } from '@/features/manage/banners/actions';

export default async function AdminBannersPage() {
  const initialResult = await listBannersAction(1);

  return <BannersManager initialResult={initialResult} />;
}
