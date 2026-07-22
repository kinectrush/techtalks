'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  FormProvider,
  useForm,
  type FieldErrors,
} from 'react-hook-form';
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
import { ArticleCategoryAuthorFields } from '@/features/manage/components/article-category-author-fields';
import {
  adminArticleSchema,
  formValuesToArticleInput,
  type AdminArticleFormValues,
} from '@/features/manage/articles/schema';
import {
  createArticleAction,
  updateArticleAction,
} from '@/features/manage/articles/actions';
import {
  buildArticleFormDefaults,
  type ArticleFormCategoryOption,
  type ArticleFormOption,
} from '@/features/manage/articles/form-options';
import {
  ARTICLE_DETAIL_BANNER_DESKTOP_ASPECT,
  ARTICLE_DETAIL_BANNER_MOBILE_ASPECT,
} from '@/lib/ad-banners/constants';
import { slugify } from '@/lib/slug';
import { reviewDetailPageUrl } from '@/lib/site-assets';
import { cn } from '@/lib/utils';
import type { AdminArticleRow } from '@/types/admin';

type ArticleEditorPageProps = {
  article: AdminArticleRow | null;
  categories: ArticleFormCategoryOption[];
  authors: ArticleFormOption[];
  backHref?: string;
};

const tabPanelClass = 'mt-0 data-[state=inactive]:hidden';

export function ArticleEditorPage(props: ArticleEditorPageProps) {
  return <ArticleEditorForm key={props.article?.id ?? 'new'} {...props} />;
}

function ArticleEditorForm({
  article,
  categories,
  authors,
  backHref = '/manage/admin/articles',
}: ArticleEditorPageProps) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const isEdit = Boolean(article);

  const defaultValues = useMemo(
    () => buildArticleFormDefaults(article, categories, authors),
    [article, categories, authors],
  );

  const form = useForm<AdminArticleFormValues>({
    resolver: zodResolver(adminArticleSchema),
    shouldUnregister: false,
    defaultValues,
  });

  const { register, handleSubmit, watch, setValue, formState } = form;
  const title = watch('title');
  const slug = watch('slug');
  const canonicalUrl = slug.trim() ? reviewDetailPageUrl(slug.trim()) : '';
  const previewHref = slug.trim()
    ? `/review/${encodeURIComponent(slug.trim())}?view=draft`
    : null;

  useEffect(() => {
    if (!slugTouched && title && !isEdit) {
      setValue('slug', slugify(title));
    }
  }, [title, slugTouched, setValue, isEdit]);

  function onInvalid(errors: FieldErrors<AdminArticleFormValues>) {
    const first = Object.values(errors)[0];
    toast.error(
      first?.message?.toString() ?? 'Vui lòng kiểm tra lại các trường bắt buộc',
    );
  }

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
        <div className="flex flex-wrap items-center gap-2">
          {previewHref ? (
            <Button variant="outline" asChild disabled={isSaving}>
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Xem trước
              </a>
            </Button>
          ) : null}
          <ManageLoadingButton
            type="submit"
            form="article-editor-form"
            isLoading={isSaving}
            loadingLabel="Đang lưu..."
          >
            Lưu
          </ManageLoadingButton>
        </div>
      </div>

      <FormProvider {...form}>
        <form
          id="article-editor-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="relative rounded-xl border bg-card"
        >
          <ManagePendingOverlay show={isSaving} />

          <div className="border-b px-4 py-4 sm:px-6">
            <ArticleCategoryAuthorFields
              categories={categories}
              authors={authors}
              categoryNameHint={article?.categoryName}
              authorNameHint={article?.authorName}
            />
          </div>

          <Tabs defaultValue="basic" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-muted/20 px-2 sm:px-4">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="content">Nội dung</TabsTrigger>
              <TabsTrigger value="media">Ảnh</TabsTrigger>
              <TabsTrigger value="seo">SEO / Meta</TabsTrigger>
              <TabsTrigger value="ad-banner">Banner QC</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            <div className="p-4 sm:p-6">
              <TabsContent
                forceMount
                value="basic"
                className={cn(tabPanelClass, 'space-y-4')}
              >
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
                  <Input
                    id="affiliateUrl"
                    placeholder="https://..."
                    {...register('affiliateUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Mô tả ngắn (lead) *</Label>
                  <Textarea id="excerpt" rows={3} {...register('excerpt')} />
                </div>
              </TabsContent>

              <TabsContent
                forceMount
                value="content"
                className={cn(tabPanelClass, 'space-y-4')}
              >
                <div className="space-y-2">
                  <Label>Nội dung bài</Label>
                  <RichTextEditor
                    key={article?.id ?? 'new-article'}
                    value={watch('content') ?? ''}
                    onChange={(html) =>
                      setValue('content', html, { shouldDirty: true })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagsText">Tags (phân cách bằng dấu phẩy)</Label>
                  <Input id="tagsText" {...register('tagsText')} />
                </div>
              </TabsContent>

              <TabsContent
                forceMount
                value="media"
                className={cn(tabPanelClass, 'space-y-4')}
              >
                <ImageUploadField
                  label="Ảnh bìa"
                  folder="covers"
                  required
                  value={watch('coverImage')}
                  onChange={(url) =>
                    setValue('coverImage', url, { shouldValidate: true })
                  }
                />
                {watch('isEditorPick') ? (
                  <>
                    <ImageUploadField
                      label="Ảnh bìa (Biên tập chọn) - Mobile"
                      folder="editor-picks"
                      value={watch('editorPickCoverImageMobile') ?? ''}
                      onChange={(url) =>
                        setValue('editorPickCoverImageMobile', url)
                      }
                    />
                    <ImageUploadField
                      label="Ảnh bìa (Biên tập chọn) - Desktop"
                      folder="editor-picks"
                      value={watch('editorPickCoverImageDesktop') ?? ''}
                      onChange={(url) =>
                        setValue('editorPickCoverImageDesktop', url)
                      }
                    />
                  </>
                ) : null}
              </TabsContent>

              <TabsContent
                forceMount
                value="seo"
                className={cn(tabPanelClass, 'space-y-4')}
              >
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input id="metaTitle" {...register('metaTitle')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <Textarea
                    id="metaDescription"
                    rows={3}
                    maxLength={320}
                    {...register('metaDescription')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta keywords</Label>
                  <Input id="metaKeywords" {...register('metaKeywords')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={canonicalUrl}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </TabsContent>

              <TabsContent
                forceMount
                value="ad-banner"
                className={cn(tabPanelClass, 'space-y-6')}
              >
                <p className="text-sm text-muted-foreground">
                  Banner quảng cáo riêng cho trang chi tiết bài viết này (không
                  dùng chung với menu Banner site).
                </p>
                <div className="space-y-4 rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    Desktop — cột phải (
                    {ARTICLE_DETAIL_BANNER_DESKTOP_ASPECT === '9/16'
                      ? '9:16'
                      : '16:9'}
                    )
                  </p>
                  <ImageUploadField
                    label="Ảnh banner desktop"
                    folder="banners"
                    value={watch('detailAdBannerDesktopImageUrl') ?? ''}
                    onChange={(url) =>
                      setValue('detailAdBannerDesktopImageUrl', url, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <div className="space-y-2">
                    <Label htmlFor="detailAdBannerDesktopLinkUrl">
                      Link khi click (tùy chọn)
                    </Label>
                    <Input
                      id="detailAdBannerDesktopLinkUrl"
                      type="url"
                      placeholder="https://..."
                      {...register('detailAdBannerDesktopLinkUrl')}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Hiển thị banner desktop</p>
                      <p className="text-xs text-muted-foreground">
                        Cần có ảnh và bật active
                      </p>
                    </div>
                    <Switch
                      checked={watch('detailAdBannerDesktopActive') ?? false}
                      disabled={isSaving}
                      onCheckedChange={(v) =>
                        setValue('detailAdBannerDesktopActive', v)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    Mobile — dưới tags (
                    {ARTICLE_DETAIL_BANNER_MOBILE_ASPECT === '16/9'
                      ? '16:9'
                      : '9:16'}
                    )
                  </p>
                  <ImageUploadField
                    label="Ảnh banner mobile"
                    folder="banners"
                    value={watch('detailAdBannerMobileImageUrl') ?? ''}
                    onChange={(url) =>
                      setValue('detailAdBannerMobileImageUrl', url, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <div className="space-y-2">
                    <Label htmlFor="detailAdBannerMobileLinkUrl">
                      Link khi click (tùy chọn)
                    </Label>
                    <Input
                      id="detailAdBannerMobileLinkUrl"
                      type="url"
                      placeholder="https://..."
                      {...register('detailAdBannerMobileLinkUrl')}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Hiển thị banner mobile</p>
                      <p className="text-xs text-muted-foreground">
                        Cần có ảnh và bật active
                      </p>
                    </div>
                    <Switch
                      checked={watch('detailAdBannerMobileActive') ?? false}
                      disabled={isSaving}
                      onCheckedChange={(v) =>
                        setValue('detailAdBannerMobileActive', v)
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                forceMount
                value="settings"
                className={cn(tabPanelClass, 'space-y-4')}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Ngày xuất bản</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      {...register('publishedAt')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(v) =>
                        setValue('status', v as AdminArticleFormValues['status'])
                      }
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
      </FormProvider>
    </div>
  );
}
