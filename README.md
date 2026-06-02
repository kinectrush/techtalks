# Next.js App Router Boilerplate (Production-ready)

Boilerplate hiện đại với **Next.js 16** (App Router, tương thích pattern Next.js 15), **React 19**, **TypeScript strict**, **Tailwind CSS v4**, **shadcn/ui**, **next-intl**, **Zustand**, **SWR**, **React Hook Form + Zod**, **next-themes**, **Axios**, **Sonner**.

> Dự án cài sẵn Next.js 16 — API App Router tương đương Next 15; xem `node_modules/next/dist/docs/` khi cần tra cứu chính thức.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở [http://localhost:3000/vi](http://localhost:3000/vi) (locale mặc định: **vi**).

**Demo login:** `demo@example.com` / `password`

## Cấu trúc thư mục

```
src/
├── app/[locale]/          # App Router theo locale
│   ├── (auth)/login
│   ├── (dashboard)/dashboard
│   └── layout.tsx
├── app/api/               # Auth + Proxy + Mock
├── components/            # ui, common, layout, forms
├── features/              # auth, product, dashboard
├── i18n/                  # routing, request, messages
├── stores/                # Zustand + persist
├── swr/                   # SWR config & keys
├── proxy.ts               # next-intl + auth guard (Next.js 16)
└── providers.tsx
```

---

## Cấu hình next-intl (Next.js App Router)

### 1. Plugin (`next.config.ts`)

```ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
```

### 2. Routing (`src/i18n/routing.ts`)

- `locales`: `vi`, `en`
- `defaultLocale`: `vi`
- `localePrefix: 'always'` → URL dạng `/vi/...`, `/en/...`
- `localeDetection: true` → ưu tiên `Accept-Language` / cookie khi vào `/`

### 3. Request config (`src/i18n/request.ts`)

Load messages theo locale cho **Server Components** và truyền xuống client qua `Providers`.

### 4. Proxy (`src/proxy.ts`)

Next.js 16 đổi tên `middleware` → `proxy`. `createMiddleware(routing)` xử lý redirect locale + bảo vệ route `/dashboard/*` (cookie `access_token`).

### 5. Type-safe messages (`src/global.d.ts`)

```ts
import type messages from '@/i18n/messages/vi.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
    Locale: 'vi' | 'en';
  }
}
```

### Server Component

```tsx
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('Home');
return <h1>{t('title')}</h1>;
```

### Client Component

```tsx
'use client';
import { useTranslations } from 'next-intl';

const t = useTranslations('Auth');
```

### Language Switcher

Xem `src/components/common/language-switcher.tsx` — dùng `useRouter` + `usePathname` từ `@/i18n/navigation` (không dùng `next/navigation` thuần) để giữ locale-aware routing.

---

## API Proxy (ẩn backend)

Client **chỉ** gọi `/api/proxy/*` qua `axiosClient` (`src/lib/axios-client.ts`).

| Biến môi trường | Vai trò |
|-----------------|--------|
| `API_BASE_URL` | URL backend thật (server-only) |
| `USE_MOCK_API=true` | Trả mock từ `src/lib/mock-proxy.ts` (dev/demo) |

Luồng:

1. Browser → `GET /api/proxy/products`
2. Route `app/api/proxy/[...path]/route.ts` → `proxyRequest()` forward tới `API_BASE_URL/products`
3. Gắn `Authorization` từ cookie `access_token`, tự refresh nếu 401 (cookie `refresh_token`)

Auth routes riêng: `/api/auth/login`, `/logout`, `/refresh` — set HttpOnly cookies, không lộ token ra client JS (trừ user profile trong Zustand).

---

## Zustand + SWR + next-intl + Caching

| Layer | Dùng cho | Ghi chú |
|-------|----------|---------|
| **next-intl** | UI strings | Server: `getTranslations`; Client: `useTranslations`. Validation Zod: `useLoginSchema()` |
| **Zustand persist** | User UI state, sidebar | Không lưu token — token ở HttpOnly cookie |
| **SWR** | Client refetch, stale UI | Key: `src/swr/keys.ts`, fetcher qua proxy |
| **Server Actions / `unstable_cache`** | ISR demo products | `revalidate: 60`, tag `products` |
| **Next.js cache** | SSR/SSG/ISR | Server data ≠ SWR cache — invalidate SWR sau mutation: `mutate(key)` |

**Best practices:**

1. **Server-first**: list tĩnh/SEO → Server Component + `unstable_cache`; realtime → SWR.
2. **Một nguồn auth**: cookie (server) + Zustand `user` (client display); sync bằng `useAuth` + `/users/me`.
3. **Sau login/logout**: `mutate(swrKeys.currentUser)` hoặc clear SWR cache.
4. **i18n validation**: schema trong hook phụ thuộc `useTranslations` để message đổi theo locale.
5. **Không fetch backend trực tiếp từ browser** — luôn qua `/api/proxy`.

---

## Scripts

| Command | Mô tả |
|---------|--------|
| `npm run dev` | Development |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |

## Thêm locale

1. Thêm vào `src/i18n/routing.ts` → `locales`
2. Tạo `src/i18n/messages/xx.json`
3. Cập nhật `src/global.d.ts` nếu cần
4. Cập nhật `proxy.ts` matcher

## Thêm shadcn component

```bash
npx shadcn@latest add button
```

Cấu hình: `components.json`.
