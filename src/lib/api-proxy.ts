import { type NextRequest } from 'next/server';

import { AUTH_COOKIE, REFRESH_COOKIE } from '@/lib/constants';
import { getServerApiBaseUrl } from '@/lib/env';

export async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
) {
  const baseUrl = getServerApiBaseUrl().replace(/\/$/, '');
  const targetPath = pathSegments.join('/');
  const url = new URL(`${baseUrl}/${targetPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const accessToken = request.cookies.get(AUTH_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const upstream = await fetch(url, init);

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('transfer-encoding');

  if (upstream.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed?.accessToken) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      const retry = await fetch(url, { ...init, headers });
      return buildProxyResponse(retry, refreshed);
    }
  }

  return buildProxyResponse(upstream);
}

async function refreshAccessToken(refreshToken: string) {
  const baseUrl = getServerApiBaseUrl().replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    accessToken: string;
    refreshToken?: string;
  }>;
}

function buildProxyResponse(
  upstream: Response,
  tokens?: { accessToken: string; refreshToken?: string },
) {
  const response = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });

  if (tokens?.accessToken) {
    response.headers.append(
      'Set-Cookie',
      `${AUTH_COOKIE}=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
    );
  }
  if (tokens?.refreshToken) {
    response.headers.append(
      'Set-Cookie',
      `${REFRESH_COOKIE}=${tokens.refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
    );
  }

  return response;
}
