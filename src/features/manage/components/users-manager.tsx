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
import { TooltipProvider } from '@/components/ui/tooltip';
import { ManageActionButton } from '@/features/manage/components/manage-action-button';
import { ManagePagination } from '@/features/manage/components/manage-pagination';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { UserFormDialog } from '@/features/manage/components/user-form-dialog';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import {
  listUsersAction,
  toggleUserActiveAction,
} from '@/features/manage/users/actions';
import { totalPages, type PaginatedResult } from '@/lib/pagination';
import type { AdminUser } from '@/types/admin';

type UsersManagerProps = {
  initialResult: PaginatedResult<AdminUser>;
  currentUserId: string;
};

export function UsersManager({
  initialResult,
  currentUserId,
}: UsersManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { run, isAnyPending } = usePendingKeys();

  const tableBusy = isAnyPending || isSaving;
  const users = result.items;

  async function fetchPage(page: number) {
    const data = await listUsersAction(page, result.pageSize);
    setResult(data);
  }

  function handlePageChange(page: number) {
    void run('page', async () => {
      try {
        await fetchPage(page);
      } catch {
        toast.error('Không tải được danh sách user');
      }
    });
  }

  function handleToggleActive(id: string, isActive: boolean) {
    void run(`toggle:${id}`, async () => {
      try {
        await toggleUserActiveAction(id, isActive);
        setResult((prev) => ({
          ...prev,
          items: prev.items.map((u) =>
            u.id === id ? { ...u, isActive } : u,
          ),
        }));
        toast.success(isActive ? 'Đã bật user' : 'Đã tắt user');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
      }
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý user</h1>
            <p className="text-sm text-muted-foreground">
              Tài khoản đăng nhập luồng /manage/admin (mật khẩu được hash bcrypt).
            </p>
          </div>
          <Button
            disabled={tableBusy}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tạo user
          </Button>
        </div>

        <div className="relative rounded-lg border">
          <ManagePendingOverlay show={tableBusy} />
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có user
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
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
                        disabled={
                          tableBusy ||
                          (user.id === currentUserId && user.isActive)
                        }
                        onCheckedChange={(v) => handleToggleActive(user.id, v)}
                      />
                    </TableCell>
                    <TableCell>
                      <ManageActionButton
                        label="Chỉnh sửa"
                        disabled={tableBusy}
                        onClick={() => {
                          setEditing(user);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </ManageActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ManagePagination
          page={result.page}
          total={result.total}
          pageSize={result.pageSize}
          onPageChange={handlePageChange}
          disabled={tableBusy}
        />

        <UserFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (isSaving) return;
            setDialogOpen(open);
          }}
          user={editing}
          onSaved={async () => {
            const pages = totalPages(result.total + (editing ? 0 : 1), result.pageSize);
            await fetchPage(editing ? result.page : pages);
          }}
          onSavingChange={setIsSaving}
        />
      </div>
    </TooltipProvider>
  );
}
