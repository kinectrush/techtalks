'use client';

import { useMemo } from 'react';
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
  withSelectedFormOption,
  type ArticleFormOption,
} from '@/features/manage/articles/form-options';
import type { AdminArticleFormValues } from '@/features/manage/articles/schema';

type ArticleCategoryAuthorFieldsProps = {
  categories: ArticleFormOption[];
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
  const { control, watch } = useFormContext<AdminArticleFormValues>();
  const categoryId = watch('categoryId');
  const authorId = watch('authorId');

  const categoryOptions = useMemo(() => {
    const name =
      categories.find((c) => c.id === categoryId)?.name ?? categoryNameHint;
    return withSelectedFormOption(categories, categoryId, name);
  }, [categories, categoryId, categoryNameHint]);

  const authorOptions = useMemo(() => {
    const name = authors.find((a) => a.id === authorId)?.name ?? authorNameHint;
    return withSelectedFormOption(authors, authorId, name);
  }, [authors, authorId, authorNameHint]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Danh mục *</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              key={`category-${field.value}`}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
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
