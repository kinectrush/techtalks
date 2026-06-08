'use client';

import { Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
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
  toggleCategoryHomepageFeaturedAction,
} from '@/features/manage/categories/actions';
import type { AdminCategory } from '@/types/admin';

type CategoriesManagerProps = {
  initialCategories: AdminCategory[];
};

function sortCategories(categories: AdminCategory[]) {
  return [...categories].sort((a, b) => {
    if (a.parentId && b.parentId && a.parentId === b.parentId) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.parentId === b.id) return 1;
    if (b.parentId === a.id) return -1;
    if (a.parentId && !b.parentId) {
      if (a.parentId === b.id) return 1;
      const parentOrder =
        categories.find((c) => c.id === a.parentId)?.sortOrder ?? 0;
      if (parentOrder !== b.sortOrder) return parentOrder - b.sortOrder;
      return 1;
    }
    if (b.parentId && !a.parentId) {
      if (b.parentId === a.id) return -1;
      const parentOrder =
        categories.find((c) => c.id === b.parentId)?.sortOrder ?? 0;
      if (parentOrder !== a.sortOrder) return a.sortOrder - parentOrder;
      return -1;
    }
    return a.sortOrder - b.sortOrder;
  });
}

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { run, isAnyPending } = usePendingKeys();

  const tableBusy = isAnyPending || isSaving;

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );

  const parentOptions = useMemo(
    () =>
      categories
        .filter((c) => !c.parentId)
        .map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

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

  function handleToggleHomepage(id: string, showOnHomepage: boolean) {
    void run(`homepage:${id}`, async () => {
      try {
        await toggleCategoryHomepageFeaturedAction(id, showOnHomepage);
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, showOnHomepage } : c)),
        );
        toast.success(
          showOnHomepage
            ? 'Đã bật nổi bật trang chủ'
            : 'Đã tắt nổi bật trang chủ',
        );
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
              Danh mục gốc hiển thị trên menu. Sub-category dùng để nhóm tin
              nổi bật trang chủ (ví dụ World Cup 2026).
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
                <TableHead>Loại</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Trang chủ</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((cat) => {
                const isSub = Boolean(cat.parentId);
                return (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">
                      {isSub ? (
                        <span className="pl-4 text-muted-foreground">↳ </span>
                      ) : null}
                      {cat.name}
                      {cat.parentName ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({cat.parentName})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell>
                      {isSub ? (
                        <Badge variant="secondary">Sub</Badge>
                      ) : (
                        <Badge variant="outline">Gốc</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {cat.showInMenu ? (
                        <Badge>Menu</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isSub ? (
                        <Switch
                          checked={cat.showOnHomepage}
                          disabled={tableBusy || !cat.isActive}
                          onCheckedChange={(v) =>
                            handleToggleHomepage(cat.id, v)
                          }
                        />
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
                );
              })}
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
          parentOptions={parentOptions}
          onSaved={refresh}
          onSavingChange={setIsSaving}
        />
      </div>
    </TooltipProvider>
  );
}
