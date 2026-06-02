-- Contact messages submitted from site footer dialog

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  email text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Allow anyone to submit a message (public footer dialog).
-- Admin reads via service role (bypasses RLS).
create policy "contact_messages_insert_anyone"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

