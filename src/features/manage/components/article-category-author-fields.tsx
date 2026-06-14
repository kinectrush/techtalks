'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ARTICLE_ALL_SUBCATEGORY,
  getParentCategories,
  getSubcategoriesForParent,
  withSelectedFormOption,
  type ArticleFormCategoryOption,
  type ArticleFormOption,
} from '@/features/manage/articles/form-options';
import type { AdminArticleFormValues } from '@/features/manage/articles/schema';

type ArticleCategoryAuthorFieldsProps = {
  categories: ArticleFormCategoryOption[];
  authors: ArticleFormOption[];
  categoryNameHint?: string;
  authorNameHint?: string;
};

export function ArticleCategoryAuthorFields({
  categories,
  authors,
  categoryNameHint,
  authorNameHint,
}: ArticleCategoryAuthorFieldsProps) {
  const { control, watch, setValue } = useFormContext<AdminArticleFormValues>();
  const parentCategoryId = watch('parentCategoryId');
  const subcategoryId = watch('subcategoryId');
  const authorId = watch('authorId');
  const prevParentRef = useRef(parentCategoryId);

  const parentOptions = useMemo(() => {
    const parents = getParentCategories(categories);
    const name =
      parents.find((category) => category.id === parentCategoryId)?.name ??
      categoryNameHint;
    return withSelectedFormOption(parents, parentCategoryId, name);
  }, [categories, parentCategoryId, categoryNameHint]);

  const subcategoryOptions = useMemo(() => {
    const subs = getSubcategoriesForParent(categories, parentCategoryId);
    if (subcategoryId === ARTICLE_ALL_SUBCATEGORY) {
      return subs;
    }
    const name =
      subs.find((category) => category.id === subcategoryId)?.name ??
      categoryNameHint;
    return withSelectedFormOption(subs, subcategoryId, name);
  }, [categories, parentCategoryId, subcategoryId, categoryNameHint]);

  const authorOptions = useMemo(() => {
    const name = authors.find((a) => a.id === authorId)?.name ?? authorNameHint;
    return withSelectedFormOption(authors, authorId, name);
  }, [authors, authorId, authorNameHint]);

  const hasSubcategories = subcategoryOptions.length > 0;

  useEffect(() => {
    if (prevParentRef.current === parentCategoryId) return;
    prevParentRef.current = parentCategoryId;
    setValue('subcategoryId', ARTICLE_ALL_SUBCATEGORY);
  }, [parentCategoryId, setValue]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Danh mục *</Label>
        <Controller
          name="parentCategoryId"
          control={control}
          render={({ field }) => (
            <Select
              key={`parent-category-${field.value}`}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {parentOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {hasSubcategories ? (
        <div className="space-y-2">
          <Label>Danh mục con</Label>
          <Controller
            name="subcategoryId"
            control={control}
            render={({ field }) => (
              <Select
                key={`subcategory-${parentCategoryId}-${field.value}`}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục con" />
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
            )}
          />
        </div>
      ) : null}

      <div className={hasSubcategories ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
        <Label>Tác giả *</Label>
        <Controller
          name="authorId"
          control={control}
          render={({ field }) => (
            <Select
              key={`author-${field.value}`}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn tác giả" />
              </SelectTrigger>
              <SelectContent>
                {authorOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}
