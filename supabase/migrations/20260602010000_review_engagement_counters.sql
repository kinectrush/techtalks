-- Atomic counters for views/likes in review_articles.engagement (jsonb)

create or replace function public.increment_review_views(p_id uuid)
returns jsonb
language plpgsql
as $$
declare
  updated jsonb;
begin
  update public.review_articles
  set engagement =
      jsonb_set(
        jsonb_set(
          jsonb_set(
            engagement,
            '{views}',
            to_jsonb(coalesce((engagement->>'views')::int, 0) + 1),
            true
          ),
          '{views24h}',
          to_jsonb(coalesce((engagement->>'views24h')::int, 0) + 1),
          true
        ),
        '{views7d}',
        to_jsonb(coalesce((engagement->>'views7d')::int, 0) + 1),
        true
      )
  where id = p_id
  returning engagement into updated;

  return updated;
end;
$$;

create or replace function public.increment_review_reactions(p_id uuid)
returns jsonb
language plpgsql
as $$
declare
  updated jsonb;
begin
  update public.review_articles
  set engagement =
      jsonb_set(
        jsonb_set(
          jsonb_set(
            engagement,
            '{reactions}',
            to_jsonb(coalesce((engagement->>'reactions')::int, 0) + 1),
            true
          ),
          '{reactions24h}',
          to_jsonb(coalesce((engagement->>'reactions24h')::int, 0) + 1),
          true
        ),
        '{reactions7d}',
        to_jsonb(coalesce((engagement->>'reactions7d')::int, 0) + 1),
        true
      )
  where id = p_id
  returning engagement into updated;

  return updated;
end;
$$;

