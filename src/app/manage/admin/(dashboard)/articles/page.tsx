import { ArticlesManager } from '@/features/manage/components/articles-manager';
import {
  getArticleFormOptionsAction,
  getTotalArticleViewsAction,
  listArticlesAction,
} from '@/features/manage/articles/actions';

export default async function AdminArticlesPage() {
  const [articlesResult, options, totalViews] = await Promise.all([
    listArticlesAction({ page: 1 }),
    getArticleFormOptionsAction(),
    getTotalArticleViewsAction(),
  ]);

  return (
    <ArticlesManager
      initialResult={articlesResult}
      totalViews={totalViews}
      categories={options.categories}
      authors={options.authors}
    />
  );
}
