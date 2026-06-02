/** Categories hidden from public site (menu, filters, listings). */
export const EXCLUDED_PUBLIC_CATEGORY_SLUGS = ['general'] as const;

export function filterPublicCategories<T extends { slug: string }>(
  categories: T[],
): T[] {
  return categories.filter(
    (c) =>
      !EXCLUDED_PUBLIC_CATEGORY_SLUGS.includes(
        c.slug as (typeof EXCLUDED_PUBLIC_CATEGORY_SLUGS)[number],
      ),
  );
}
