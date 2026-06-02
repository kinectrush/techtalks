import { productApi } from '@/apis/product-api';

export const productService = {
  list: (page = 1) => productApi.list({ page, pageSize: 10 }),
  getById: (id: string) => productApi.getById(id),
};
