-- Add separate cover images for "Editor's pick" (mobile + desktop)

alter table public.review_articles
add column if not exists editor_pick_cover_image_mobile text,
add column if not exists editor_pick_cover_image_desktop text;

