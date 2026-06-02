import { UsersManager } from '@/features/manage/components/users-manager';
import {
  getAdminSessionAction,
} from '@/features/manage/auth/actions';
import { listUsersAction } from '@/features/manage/users/actions';

export default async function AdminUsersPage() {
  const [users, current] = await Promise.all([
    listUsersAction(),
    getAdminSessionAction(),
  ]);

  if (!current) return null;

  return (
    <UsersManager initialUsers={users} currentUserId={current.id} />
  );
}
