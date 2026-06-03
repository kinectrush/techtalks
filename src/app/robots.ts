import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';

/** Luồng user công khai — cho phép Google/Facebook crawl & preview. */
const PUBLIC_ALLOW = ['/', '/reviews', '/review/'];

/** Admin, auth, API — không cho bot kiểm tra / index. */
const DISALLOW = ['/manage', '/login', '/register', '/api'];

export default function robots(): MetadataRoute.Robots {
  const publicSite = {
    allow: PUBLIC_ALLOW,
    disallow: DISALLOW,
  };

  return {
    rules: [
      { userAgent: '*', ...publicSite },
      { userAgent: 'Googlebot', ...publicSite },
      { userAgent: 'facebookexternalhit', ...publicSite },
    ],
    host: env.appUrl,
  };
}
