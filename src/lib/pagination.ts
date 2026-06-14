export const DEFAULT_PAGE_SIZE = 10;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function paginateRange(page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  return { from, to: from + pageSize - 1, page: safePage };
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const total = items.length;
  const pages = totalPages(total, pageSize);
  const safePage = Math.min(Math.max(1, page), pages);
  const from = (safePage - 1) * pageSize;

  return {
    items: items.slice(from, from + pageSize),
    total,
    page: safePage,
    pageSize,
  };
}
