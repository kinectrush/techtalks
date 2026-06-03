'use client';

import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  deleteArticleAction,
  duplicateArticleAction,
  listArticlesAction,
  toggleArticleActiveAction,
} from '@/features/manage/articles/actions';
import { ManageActionButton } from '@/features/manage/components/manage-action-button';
import { ManageLoadingButton } from '@/features/manage/components/manage-loading-button';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import type { AdminArticleRow } from '@/types/admin';

type Option = { id: string; name: string; slug?: string };

type ArticlesManagerProps = {
  initialArticles: AdminArticleRow[];
  categories: Option[];
  authors: Option[];
};

export function ArticlesManager({
  initialArticles,
}: ArticlesManagerProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState('');
  const { run, isPending, isAnyPending } = usePendingKeys();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<AdminArticleRow | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const tableBusy = isAnyPending || isDeleting;

  function handleSearch() {
    void run('search', async () => {
      try {
        const data = await listArticlesAction(search || undefined);
        setArticles(data);
      } catch {
        toast.error('Không tải được danh sách bài viết');
      }
    });
  }

  function openCreate() {
    if (tableBusy) return;
    router.push('/manage/admin/articles/new');
  }

  function openEdit(article: AdminArticleRow) {
    if (tableBusy) return;
    router.push(`/manage/admin/articles/${article.id}`);
  }

  function openDeleteDialog(article: AdminArticleRow) {
    if (tableBusy) return;
    setArticleToDelete(article);
    setDeleteOpen(true);
  }

  function handleDuplicate(id: string) {
    void run(`duplicate:${id}`, async () => {
      try {
        const duplicated = await duplicateArticleAction(id);
        setArticles((prev) => [duplicated, ...prev]);
        toast.success('Đã nhân bản bài viết');
      } catch {
        toast.error('Nhân bản thất bại');
      }
    });
  }

  async function confirmDelete() {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteArticleAction(articleToDelete.id);
      setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
      toast.success('Đã xóa bài viết');
      setDeleteOpen(false);
      setArticleToDelete(null);
    } catch {
      toast.error('Xóa bài viết thất bại');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleToggleActive(id: string, isActive: boolean) {
    void run(`toggle:${id}`, async () => {
      try {
        await toggleArticleActiveAction(id, isActive);
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive } : a)),
        );
        toast.success(isActive ? 'Đã bật bài viết' : 'Đã tắt bài viết');
      } catch {
        toast.error('Cập nhật thất bại');
      }
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
            <p className="text-sm text-muted-foreground">
              Tạo, chỉnh sửa và bật/tắt hiển thị bài review trên site.
            </p>
          </div>
          <Button onClick={openCreate} disabled={tableBusy}>
            <Plus className="h-4 w-4" />
            Tạo mới
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tiêu đề hoặc slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={tableBusy}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <ManageLoadingButton
            variant="secondary"
            onClick={handleSearch}
            isLoading={isPending('search')}
            loadingLabel="Đang tìm..."
            disabled={tableBusy && !isPending('search')}
          >
            Tìm kiếm
          </ManageLoadingButton>
        </div>

        <div className="relative rounded-lg border">
          <ManagePendingOverlay show={tableBusy} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[150px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có bài viết
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{article.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={article.isActive}
                        disabled={tableBusy}
                        onCheckedChange={(v) =>
                          handleToggleActive(article.id, v)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ManageActionButton
                          label="Chỉnh sửa"
                          onClick={() => openEdit(article)}
                          disabled={tableBusy}
                        >
                          <Pencil className="h-4 w-4" />
                        </ManageActionButton>
                        <ManageActionButton
                          label="Nhân bản"
                          onClick={() => handleDuplicate(article.id)}
                          disabled={tableBusy}
                          isLoading={isPending(`duplicate:${article.id}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </ManageActionButton>
                        <ManageActionButton
                          label="Xóa"
                          onClick={() => openDeleteDialog(article)}
                          disabled={tableBusy}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ManageActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (isDeleting) return;
            setDeleteOpen(open);
            if (!open) setArticleToDelete(null);
          }}
        >
          <AlertDialogContent>
            <div className="relative">
            <ManagePendingOverlay show={isDeleting} />
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa &ldquo;{articleToDelete?.title}&rdquo;?
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  void confirmDelete();
                }}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </AlertDialogAction>
            </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
