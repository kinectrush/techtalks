'use client';

import { Pencil, Plus, Search } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

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
import { ArticleFormDialog } from '@/features/manage/components/article-form-dialog';
import {
  listArticlesAction,
  toggleArticleActiveAction,
} from '@/features/manage/articles/actions';
import type { AdminArticleRow } from '@/types/admin';

type Option = { id: string; name: string; slug?: string };

type ArticlesManagerProps = {
  initialArticles: AdminArticleRow[];
  categories: Option[];
  authors: Option[];
};

export function ArticlesManager({
  initialArticles,
  categories,
  authors,
}: ArticlesManagerProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminArticleRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await listArticlesAction(search || undefined);
        setArticles(data);
      } catch {
        toast.error('Không tải được danh sách bài viết');
      }
    });
  }, [search]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(article: AdminArticleRow) {
    setEditing(article);
    setDialogOpen(true);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await toggleArticleActiveAction(id, isActive);
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive } : a)),
      );
      toast.success(isActive ? 'Đã bật bài viết' : 'Đã tắt bài viết');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <p className="text-sm text-muted-foreground">
            Tạo, chỉnh sửa và bật/tắt hiển thị bài review trên site.
          </p>
        </div>
        <Button onClick={openCreate}>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') refresh();
            }}
          />
        </div>
        <Button variant="secondary" onClick={refresh} disabled={isPending}>
          Tìm kiếm
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                      onCheckedChange={(v) =>
                        handleToggleActive(article.id, v)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(article)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ArticleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        article={editing}
        categories={categories}
        authors={authors}
        onSaved={refresh}
      />
    </div>
  );
}
