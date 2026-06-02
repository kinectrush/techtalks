import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_AUTH_COOKIE,
  ADMIN_LOGIN_PATH,
  ADMIN_REFRESH_COOKIE,
} from '@/lib/manage/constants';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const SITE_AUTH_COOKIE = 'access_token';
const SITE_PUBLIC_PATHS = ['/login', '/register'];

function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && routing.locales.includes(segments[0] as never)) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

function isAdminProtectedPath(pathname: string): boolean {
  return pathname.startsWith('/manage/admin') && !isAdminLoginPath(pathname);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect legacy locale-prefixed URLs (/vi/*, /en/*) to new non-prefixed routes.
  const legacyPath = stripLocale(pathname);
  if (legacyPath !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = legacyPath === '/' ? '/' : legacyPath;
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith('/manage')) {
    if (isAdminProtectedPath(pathname)) {
      const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
      const hasRefresh = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
      if (!token && !hasRefresh) {
        const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const pathWithoutLocale = pathname;
  const isPublic = SITE_PUBLIC_PATHS.some((p) =>
    pathWithoutLocale.startsWith(p),
  );
  const isProtected = pathWithoutLocale.startsWith('/dashboard');

  if (isProtected && !isPublic) {
    const token = request.cookies.get(SITE_AUTH_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/manage/:path*',
    '/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
