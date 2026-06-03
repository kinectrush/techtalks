'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ManageLoadingButton } from '@/features/manage/components/manage-loading-button';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { ImageUploadField } from '@/components/forms/image-upload-field';
import {
  adminArticleSchema,
  articleToFormValues,
  formValuesToArticleInput,
  type AdminArticleFormValues,
} from '@/features/manage/articles/schema';
import {
  createArticleAction,
  updateArticleAction,
} from '@/features/manage/articles/actions';
import { slugify } from '@/lib/slug';
import type { AdminArticleRow } from '@/types/admin';

type Option = { id: string; name: string; slug?: string };

type ArticleEditorPageProps = {
  article: AdminArticleRow | null;
  categories: Option[];
  authors: Option[];
  backHref?: string;
};

export function ArticleEditorPage({
  article,
  categories,
  authors,
  backHref = '/manage/admin/articles',
}: ArticleEditorPageProps) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const isEdit = Boolean(article);

  const form = useForm<AdminArticleFormValues>({
    resolver: zodResolver(adminArticleSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      editorPickCoverImageMobile: '',
      editorPickCoverImageDesktop: '',
      status: 'draft',
      isActive: true,
      rating: 4,
      publishedAt: new Date().toISOString().slice(0, 16),
      categoryId: categories[0]?.id ?? '',
      authorId: authors[0]?.id ?? '',
      isEditorPick: false,
      affiliateUrl: '',
    },
  });

  const { register, handleSubmit, watch, setValue, reset, formState } = form;
  const title = watch('title');

  useEffect(() => {
    if (!slugTouched && title && !isEdit) {
      setValue('slug', slugify(title));
    }
  }, [title, slugTouched, setValue, isEdit]);

  useEffect(() => {
    if (article) {
      reset(articleToFormValues(article));
      setSlugTouched(true);
    } else {
      reset({
        title: '',
        slug: '',
        subtitle: '',
        excerpt: '',
        content: '',
        coverImage: '',
        editorPickCoverImageMobile: '',
        editorPickCoverImageDesktop: '',
        ogImage: '',
        canonicalUrl: '',
        affiliateUrl: '',
        status: 'draft',
        isActive: true,
        rating: 4,
        publishedAt: new Date().toISOString().slice(0, 16),
        categoryId: categories[0]?.id ?? '',
        authorId: authors[0]?.id ?? '',
        tagsText: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        isEditorPick: false,
      });
      setSlugTouched(false);
    }
  }, [article, categories, authors, reset]);

  async function onSubmit(values: AdminArticleFormValues) {
    try {
      const input = formValuesToArticleInput(values);
      if (isEdit && article) {
        await updateArticleAction(article.id, input);
        toast.success('Đã cập nhật bài viết');
      } else {
        await createArticleAction(input);
        toast.success('Đã tạo bài viết');
      }
      router.push(backHref);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  const isSaving = formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-2"
            disabled={isSaving}
            onClick={() => router.push(backHref)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Soạn nội dung ở chế độ toàn trang để thao tác dễ hơn.
            </p>
          </div>
        </div>
        <ManageLoadingButton
          type="submit"
          form="article-editor-form"
          isLoading={isSaving}
          loadingLabel="Đang lưu..."
        >
          Lưu
        </ManageLoadingButton>
      </div>

      <form
        id="article-editor-form"
        onSubmit={handleSubmit(onSubmit)}
        className="relative rounded-xl border bg-card"
      >
        <ManagePendingOverlay show={isSaving} />
        <Tabs defaultValue="basic" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/20 px-4">
            <TabsTrigger value="basic">Cơ bản</TabsTrigger>
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="media">Ảnh</TabsTrigger>
            <TabsTrigger value="seo">SEO / Meta</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input id="title" {...register('title')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  {...register('slug', { onChange: () => setSlugTouched(true) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Phụ đề</Label>
                <Input id="subtitle" {...register('subtitle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliateUrl">Affiliate (URL)</Label>
                <Input id="affiliateUrl" placeholder="https://..." {...register('affiliateUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Mô tả ngắn (lead) *</Label>
                <Textarea id="excerpt" rows={3} {...register('excerpt')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={watch('categoryId')}
                    onValueChange={(v) => setValue('categoryId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tác giả</Label>
                  <Select
                    value={watch('authorId')}
                    onValueChange={(v) => setValue('authorId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tác giả" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Nội dung bài</Label>
                <RichTextEditor
                  key={article?.id ?? 'new-article'}
                  value={watch('content') ?? ''}
                  onChange={(html) => setValue('content', html, { shouldDirty: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagsText">Tags (phân cách bằng dấu phẩy)</Label>
                <Input id="tagsText" {...register('tagsText')} />
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0 space-y-4">
              <ImageUploadField
                label="Ảnh bìa"
                folder="covers"
                required
                value={watch('coverImage')}
                onChange={(url) => setValue('coverImage', url, { shouldValidate: true })}
              />
              {watch('isEditorPick') ? (
                <>
                  <ImageUploadField
                    label="Ảnh bìa (Biên tập chọn) - Mobile"
                    folder="editor-picks"
                    value={watch('editorPickCoverImageMobile') ?? ''}
                    onChange={(url) => setValue('editorPickCoverImageMobile', url)}
                  />
                  <ImageUploadField
                    label="Ảnh bìa (Biên tập chọn) - Desktop"
                    folder="editor-picks"
                    value={watch('editorPickCoverImageDesktop') ?? ''}
                    onChange={(url) => setValue('editorPickCoverImageDesktop', url)}
                  />
                </>
              ) : null}
              <ImageUploadField
                label="Ảnh Open Graph (chia sẻ mạng xã hội)"
                folder="og"
                value={watch('ogImage') ?? ''}
                onChange={(url) => setValue('ogImage', url)}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input id="metaTitle" {...register('metaTitle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea id="metaDescription" rows={3} maxLength={320} {...register('metaDescription')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta keywords</Label>
                <Input id="metaKeywords" {...register('metaKeywords')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input id="canonicalUrl" {...register('canonicalUrl')} />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Ngày xuất bản</Label>
                  <Input id="publishedAt" type="datetime-local" {...register('publishedAt')} />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(v) => setValue('status', v as AdminArticleFormValues['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Điểm đánh giá (0–5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  {...register('rating', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Hiển thị (active)</p>
                  <p className="text-xs text-muted-foreground">
                    Tắt để ẩn bài khỏi site công khai
                  </p>
                </div>
                <Switch
                  checked={watch('isActive')}
                  disabled={isSaving}
                  onCheckedChange={(v) => setValue('isActive', v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Biên tập chọn</p>
                  <p className="text-xs text-muted-foreground">
                    Bật để ưu tiên lên banner trang chủ
                  </p>
                </div>
                <Switch
                  checked={watch('isEditorPick') ?? false}
                  disabled={isSaving}
                  onCheckedChange={(v) => setValue('isEditorPick', v)}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </div>
  );
}

