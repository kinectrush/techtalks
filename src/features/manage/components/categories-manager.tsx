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
import { CategoryFormDialog } from '@/features/manage/components/category-form-dialog';
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

  async function refresh() {
    try {
      const data = await listCategoriesAction();
      setCategories(data);
    } catch {
      toast.error('Không tải được danh mục');
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await toggleCategoryActiveAction(id, isActive);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive } : c)),
      );
      toast.success(isActive ? 'Đã bật danh mục' : 'Đã tắt danh mục');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <p className="text-sm text-muted-foreground">
            Danh mục hiển thị trên menu trang chủ (Công nghệ, Thể thao, …).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tạo danh mục
        </Button>
      </div>

      <div className="rounded-lg border">
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
                    onCheckedChange={(v) => handleToggleActive(cat.id, v)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(cat);
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

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSaved={refresh}
      />
    </div>
  );
}
