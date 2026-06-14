'use client';

import { Copy, Eye, Pencil, Plus, Search, ThumbsUp, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ManagePagination } from '@/features/manage/components/manage-pagination';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import type {
  ArticleFormCategoryOption,
  ArticleFormOption,
} from '@/features/manage/articles/form-options';
import {
  ARTICLE_ALL_PARENT_CATEGORY,
  ARTICLE_ALL_SUBCATEGORY,
  getParentCategories,
  getSubcategoriesForParent,
} from '@/features/manage/articles/form-options';
import { formatNumber } from '@/lib/format';
import { totalPages, type PaginatedResult } from '@/lib/pagination';
import type { AdminArticleRow } from '@/types/admin';

type ArticlesManagerProps = {
  initialResult: PaginatedResult<AdminArticleRow>;
  totalViews: number;
  categories: ArticleFormCategoryOption[];
  authors: ArticleFormOption[];
};

export function ArticlesManager({
  initialResult,
  totalViews,
  categories,
}: ArticlesManagerProps) {
  const router = useRouter();
  const [result, setResult] = useState(initialResult);
  const [search, setSearch] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState(
    ARTICLE_ALL_PARENT_CATEGORY,
  );
  const [subcategoryId, setSubcategoryId] = useState(ARTICLE_ALL_SUBCATEGORY);
  const prevParentRef = useRef(parentCategoryId);
  const { run, isPending, isAnyPending } = usePendingKeys();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<AdminArticleRow | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const tableBusy = isAnyPending || isDeleting;
  const articles = result.items;

  const parentOptions = useMemo(
    () => getParentCategories(categories),
    [categories],
  );

  const subcategoryOptions = useMemo(() => {
    if (parentCategoryId === ARTICLE_ALL_PARENT_CATEGORY) return [];
    return getSubcategoriesForParent(categories, parentCategoryId);
  }, [categories, parentCategoryId]);

  const hasSubcategoryFilter = subcategoryOptions.length > 0;

  function buildListParams(
    page: number,
    overrides?: {
      parentId?: string;
      subId?: string;
      searchTerm?: string;
    },
  ) {
    const parent =
      overrides?.parentId ??
      (parentCategoryId !== ARTICLE_ALL_PARENT_CATEGORY
        ? parentCategoryId
        : undefined);
    const sub =
      overrides?.subId ??
      (parent ? subcategoryId : undefined);

    return {
      search: (overrides?.searchTerm ?? search) || undefined,
      parentCategoryId: parent,
      subcategoryId: sub,
      page,
      pageSize: result.pageSize,
    };
  }

  function loadList(
    page: number,
    overrides?: {
      parentId?: string;
      subId?: string;
      searchTerm?: string;
    },
  ) {
    void run('list', async () => {
      try {
        const data = await listArticlesAction(buildListParams(page, overrides));
        setResult(data);
      } catch {
        toast.error('Không tải được danh sách bài viết');
      }
    });
  }

  useEffect(() => {
    if (prevParentRef.current === parentCategoryId) return;
    prevParentRef.current = parentCategoryId;
    setSubcategoryId(ARTICLE_ALL_SUBCATEGORY);
  }, [parentCategoryId]);

  function handleFilter() {
    loadList(1);
  }

  function handleParentCategoryChange(value: string) {
    setParentCategoryId(value);
    setSubcategoryId(ARTICLE_ALL_SUBCATEGORY);
    prevParentRef.current = value;
    loadList(1, {
      parentId:
        value !== ARTICLE_ALL_PARENT_CATEGORY ? value : undefined,
      subId:
        value !== ARTICLE_ALL_PARENT_CATEGORY
          ? ARTICLE_ALL_SUBCATEGORY
          : undefined,
    });
  }

  function handleSubcategoryChange(value: string) {
    setSubcategoryId(value);
    if (parentCategoryId === ARTICLE_ALL_PARENT_CATEGORY) return;
    loadList(1, { subId: value });
  }

  function handlePageChange(page: number) {
    loadList(page);
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
        await duplicateArticleAction(id);
        loadList(1);
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
      const nextTotal = result.total - 1;
      const pages = totalPages(nextTotal, result.pageSize);
      const nextPage = Math.min(result.page, pages);
      const data = await listArticlesAction(buildListParams(nextPage));
      setResult(data);
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
        setResult((prev) => ({
          ...prev,
          items: prev.items.map((a) =>
            a.id === id ? { ...a, isActive } : a,
          ),
        }));
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

        <Card className="py-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Tổng lượt xem tất cả bài viết
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {formatNumber(totalViews, 'vi')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Tìm theo tiêu đề hoặc slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={tableBusy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFilter();
                }}
              />
            </div>
            <Select
              value={parentCategoryId}
              onValueChange={handleParentCategoryChange}
              disabled={tableBusy}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ARTICLE_ALL_PARENT_CATEGORY}>
                  Tất cả danh mục
                </SelectItem>
                {parentOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasSubcategoryFilter ? (
              <Select
                value={subcategoryId}
                onValueChange={handleSubcategoryChange}
                disabled={tableBusy}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Danh mục con" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ARTICLE_ALL_SUBCATEGORY}>
                    Tất cả
                  </SelectItem>
                  {subcategoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <ManageLoadingButton
              variant="secondary"
              onClick={handleFilter}
              isLoading={isPending('list')}
              loadingLabel="Đang lọc..."
              disabled={tableBusy && !isPending('list')}
              className="sm:w-auto"
            >
              Lọc
            </ManageLoadingButton>
          </div>
        </div>

        <div className="relative rounded-lg border">
          <ManagePendingOverlay show={tableBusy} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="text-right">Lượt xem</TableHead>
                <TableHead className="text-right">Like</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[150px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        {formatNumber(article.views, 'vi')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
                        {formatNumber(article.likes, 'vi')}
                      </span>
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

        <ManagePagination
          page={result.page}
          total={result.total}
          pageSize={result.pageSize}
          onPageChange={handlePageChange}
          disabled={tableBusy}
        />

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
