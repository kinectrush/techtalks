import axios from 'axios';
import { cookies } from 'next/headers';

import { AUTH_COOKIE } from '@/lib/constants';
import { getServerApiBaseUrl } from '@/lib/env';

export async function createServerAxios() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  return axios.create({
    baseURL: getServerApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
