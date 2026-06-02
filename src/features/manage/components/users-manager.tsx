'use client';

import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserFormDialog } from '@/features/manage/components/user-form-dialog';
import {
  listUsersAction,
  toggleUserActiveAction,
} from '@/features/manage/users/actions';
import type { AdminUser } from '@/types/admin';

type UsersManagerProps = {
  initialUsers: AdminUser[];
  currentUserId: string;
};

export function UsersManager({
  initialUsers,
  currentUserId,
}: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  async function refresh() {
    try {
      const data = await listUsersAction();
      setUsers(data);
    } catch {
      toast.error('Không tải được danh sách user');
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await toggleUserActiveAction(id, isActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive } : u)),
      );
      toast.success(isActive ? 'Đã bật user' : 'Đã tắt user');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý user</h1>
          <p className="text-sm text-muted-foreground">
            Tài khoản đăng nhập luồng /manage/admin (mật khẩu được hash bcrypt).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tạo user
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.displayName ?? user.email ?? '—'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.isActive}
                    disabled={user.id === currentUserId && user.isActive}
                    onCheckedChange={(v) => handleToggleActive(user.id, v)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSaved={refresh}
      />
    </div>
  );
}
