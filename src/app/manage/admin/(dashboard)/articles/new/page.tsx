import { ArticleEditorPage } from '@/features/manage/components/article-editor-page';
import { getArticleFormOptionsAction } from '@/features/manage/articles/actions';

export default async function AdminArticleNewPage() {
  const options = await getArticleFormOptionsAction();
  return (
    <ArticleEditorPage
      article={null}
      categories={options.categories}
      authors={options.authors}
    />
  );
}

