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
import { CategoryFormDialog } from '@/features/manage/components/category-form-dialog';
import { ManageActionButton } from '@/features/manage/components/manage-action-button';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import {
  listCategoriesAction,
  toggleCategoryActiveAction,
} from '@/features/manage/categories/actions';
import type { AdminCategory } from '@/types/admin';

type CategoriesManagerProps = {
  initialCategories: AdminCategory[];
};

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { run, isAnyPending } = usePendingKeys();

  const tableBusy = isAnyPending || isSaving;

  async function refresh() {
    setIsSaving(true);
    try {
      const data = await listCategoriesAction();
      setCategories(data);
    } catch {
      toast.error('Không tải được danh mục');
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleActive(id: string, isActive: boolean) {
    void run(`toggle:${id}`, async () => {
      try {
        await toggleCategoryActiveAction(id, isActive);
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive } : c)),
        );
        toast.success(isActive ? 'Đã bật danh mục' : 'Đã tắt danh mục');
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
            <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
            <p className="text-sm text-muted-foreground">
              Danh mục hiển thị trên menu trang chủ (Công nghệ, Thể thao, …).
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
            Tạo danh mục
          </Button>
        </div>

        <div className="relative rounded-lg border">
          <ManagePendingOverlay show={tableBusy} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    {cat.showInMenu ? (
                      <Badge>Menu</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell>
                    <Switch
                      checked={cat.isActive}
                      disabled={tableBusy}
                      onCheckedChange={(v) => handleToggleActive(cat.id, v)}
                    />
                  </TableCell>
                  <TableCell>
                    <ManageActionButton
                      label="Chỉnh sửa"
                      disabled={tableBusy}
                      onClick={() => {
                        setEditing(cat);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </ManageActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <CategoryFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (isSaving) return;
            setDialogOpen(open);
          }}
          category={editing}
          onSaved={refresh}
          onSavingChange={setIsSaving}
        />
      </div>
    </TooltipProvider>
  );
}
