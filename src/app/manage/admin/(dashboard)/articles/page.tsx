import { ArticlesManager } from '@/features/manage/components/articles-manager';
import {
  getArticleFormOptionsAction,
  listArticlesAction,
} from '@/features/manage/articles/actions';

export default async function AdminArticlesPage() {
  const [articles, options] = await Promise.all([
    listArticlesAction(),
    getArticleFormOptionsAction(),
  ]);

  return (
    <ArticlesManager
      initialArticles={articles}
      categories={options.categories}
      authors={options.authors}
    />
  );
}
