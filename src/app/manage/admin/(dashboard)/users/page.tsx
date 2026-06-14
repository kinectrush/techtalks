import { UsersManager } from '@/features/manage/components/users-manager';
import { getAdminSessionAction } from '@/features/manage/auth/actions';
import { listUsersAction } from '@/features/manage/users/actions';

export default async function AdminUsersPage() {
  const [usersResult, current] = await Promise.all([
    listUsersAction(1),
    getAdminSessionAction(),
  ]);

  if (!current) return null;

  return (
    <UsersManager initialResult={usersResult} currentUserId={current.id} />
  );
}
