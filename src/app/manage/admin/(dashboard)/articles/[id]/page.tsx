import { notFound } from 'next/navigation';

import { ArticleEditorPage } from '@/features/manage/components/article-editor-page';
import {
  getArticleAction,
  getArticleFormOptionsAction,
} from '@/features/manage/articles/actions';

type AdminArticleEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminArticleEditPage({
  params,
}: AdminArticleEditPageProps) {
  const { id } = await params;
  const [article, options] = await Promise.all([
    getArticleAction(id),
    getArticleFormOptionsAction(),
  ]);

  if (!article) notFound();

  return (
    <ArticleEditorPage
      article={article}
      categories={options.categories}
      authors={options.authors}
    />
  );
}

