import { filterPublicCategories } from '@/lib/category/constants';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';

export type MenuCategory = {
  slug: string;
  name: string;
};

const FALLBACK_MENU: MenuCategory[] = [
  { slug: 'cong-nghe', name: 'Công nghệ' },
  { slug: 'the-thao', name: 'Thể thao' },
];

export async function getMenuCategories(): Promise<MenuCategory[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_MENU;
  }

  const supabase = createSupabasePublicClientIfConfigured();
  if (!supabase) return FALLBACK_MENU;

  const { data, error } = await supabase
    .from('categories')
    .select('slug, name')
    .eq('show_in_menu', true)
    .eq('is_active', true)
    .is('parent_id', null)
    .neq('slug', 'general')
    .order('sort_order', { ascending: true });

  if (error?.code === '42703') {
    const legacy = await supabase
      .from('categories')
      .select('slug, name')
      .eq('show_in_menu', true)
      .eq('is_active', true)
      .neq('slug', 'general')
      .order('sort_order', { ascending: true });
    if (legacy.error || !legacy.data?.length) return FALLBACK_MENU;
    return filterPublicCategories(legacy.data);
  }

  if (error || !data?.length) return FALLBACK_MENU;

  return filterPublicCategories(data);
}
