-- Add optional cover image for "Editor's pick" slot

alter table public.review_articles
add column if not exists editor_pick_cover_image text;

