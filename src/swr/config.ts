import type { SWRConfiguration } from 'swr';

import { axiosClient } from '@/lib/axios-client';

export const fetcher = async <T>(url: string): Promise<T> => {
  const { data } = await axiosClient.get<T>(url);
  return data;
};

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  shouldRetryOnError: false,
};
