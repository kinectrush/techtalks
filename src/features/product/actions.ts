'use server';

import { unstable_cache } from 'next/cache';

import type { Product } from '@/types/product';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Product A',
    price: 29.99,
    description: 'Sample product for ISR demo',
  },
  {
    id: '2',
    name: 'Product B',
    price: 49.99,
    description: 'Another sample product',
  },
];

export const getProductsCached = unstable_cache(
  async (): Promise<Product[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return MOCK_PRODUCTS;
  },
  ['products-list'],
  { revalidate: 60, tags: ['products'] },
);

export async function getProductsAction() {
  return getProductsCached();
}
