export type ArticleFormOption = { id: string; name: string; slug?: string };

/** Ensures Radix Select can display the article's current category/author even if inactive. */
export function withSelectedFormOption(
  options: ArticleFormOption[],
  selectedId: string | undefined,
  selectedName: string | undefined,
): ArticleFormOption[] {
  if (!selectedId || options.some((o) => o.id === selectedId)) {
    return options;
  }
  if (!selectedName) return options;
  return [...options, { id: selectedId, name: selectedName }];
}
