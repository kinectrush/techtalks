import { CategoriesManager } from '@/features/manage/components/categories-manager';
import { listCategoriesAction } from '@/features/manage/categories/actions';

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAction();
  return <CategoriesManager initialCategories={categories} />;
}
