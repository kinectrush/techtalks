import { type NextRequest } from 'next/server';

import { proxyRequest } from '@/lib/api-proxy';
import { handleMockProxy } from '@/lib/mock-proxy';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  if (process.env.USE_MOCK_API === 'true') {
    const mock = await handleMockProxy(
      path,
      request.method,
      request.cookies.get('access_token')?.value
        ? `Bearer ${request.cookies.get('access_token')?.value}`
        : request.headers.get('authorization') ?? undefined,
    );
    if (mock) return mock;
  }

  try {
    return await proxyRequest(request, path);
  } catch {
    if (process.env.NODE_ENV === 'development') {
      const mock = await handleMockProxy(
        path,
        request.method,
        request.headers.get('authorization') ?? undefined,
      );
      if (mock) return mock;
    }
    throw new Error('Proxy request failed');
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
