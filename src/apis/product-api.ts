import { axiosClient } from '@/lib/axios-client';
import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/product';

export const productApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    axiosClient.get<PaginatedResponse<Product>>('/products', { params }),

  getById: (id: string) => axiosClient.get<Product>(`/products/${id}`),
};
