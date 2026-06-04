# Supabase — TechTalks

Project: [virrkdhzzxavcylbmsik](https://supabase.com/dashboard/project/virrkdhzzxavcylbmsik)

## 1. Environment

Copy keys from **Project Settings → API** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://virrkdhzzxavcylbmsik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
AUTH_SECRET=<random-long-string>
```

`AUTH_SECRET` dùng ký JWT session admin (HttpOnly cookie).

## 2. Apply schema

Chạy **theo thứ tự** trong [SQL Editor](https://supabase.com/dashboard/project/virrkdhzzxavcylbmsik/sql/new):

1. `supabase/migrations/20250601000000_initial_review_schema.sql`
2. `supabase/migrations/20250601100000_admin_and_article_meta.sql`
3. `supabase/migrations/20250601200000_storage_and_categories.sql`
4. `supabase/migrations/20250602000000_remove_general_category.sql`
5. `supabase/migrations/20250603000000_ad_banners.sql`
6. `supabase/migrations/20250604000000_article_detail_ad_banners.sql`

Hoặc CLI:

```bash
supabase link --project-ref virrkdhzzxavcylbmsik
supabase db push
```

## 3. Tables

| Table | Purpose |
|-------|---------|
| `categories` | Danh mục review |
| `authors` | Tác giả bài viết |
| `review_articles` | Bài viết + SEO/meta + `is_active` |
| `admin_users` | User đăng nhập `/manage/admin` (mật khẩu bcrypt) |
| `ad_banners` | Banner site-wide (trang chủ, reviews) |
| `review_articles.detail_ad_banner_*` | Banner QC theo từng bài (chi tiết bài viết) |

Migration `20250601100000` tạo user `kinectrush` (mật khẩu đã hash, không lưu plain text trong DB).

## 4. Admin routes

| URL | Mô tả |
|-----|--------|
| `/manage/admin/login` | Đăng nhập (link trực tiếp) |
| `/manage/admin/articles` | CRUD bài viết (editor rich text + upload ảnh) |
| `/manage/admin/categories` | CRUD danh mục (menu site) |
| `/manage/admin/users` | CRUD user admin |
| `/manage/admin/banners` | CRUD banner quảng cáo (upload + link) |

Storage bucket `article-images` (public read) — ảnh bìa, OG, ảnh trong nội dung.

Session: JWT trong cookie HttpOnly `admin_access_token` + refresh `admin_refresh_token`. Mọi mutation admin dùng `SUPABASE_SERVICE_ROLE_KEY` trên server.

## 5. Site vs manage auth

- `/vi/login`, `/en/login` — luồng site/demo (cookie `access_token`), **không** redirect sang manage.
- `/manage/admin/*` — luồng quản trị riêng.
