export const swrKeys = {
  currentUser: '/users/me',
  products: '/products',
  product: (id: string) => `/products/${id}` as const,
  reviews: '/reviews',
  reviewsHome: '/reviews/home',
  reviewsTrending: (window: '24h' | '7d' = '24h') =>
    `/reviews/trending?window=${window}` as const,
} as const;
