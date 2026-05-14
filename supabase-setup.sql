-- Run this in your Supabase SQL editor
-- (Safe to re-run — uses IF NOT EXISTS / ON CONFLICT)

-- 1. Messages table
create table if not exists messages (
  id         uuid        default gen_random_uuid() primary key,
  name       text,
  message    text        not null,
  file_name  text,
  file_path  text,
  created_at timestamptz default now()
);

-- 2. Row-level security: anyone can insert, nobody can read back
alter table messages enable row level security;

drop policy if exists "Allow public insert" on messages;
create policy "Allow public insert" on messages
  for insert to anon with check (true);

-- 3. Storage bucket for uploaded files
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- 4. Storage RLS: anyone can upload, only authenticated (you) can read/download
drop policy if exists "Allow anon upload" on storage.objects;
create policy "Allow anon upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'uploads');

drop policy if exists "Allow owner download" on storage.objects;
create policy "Allow owner download" on storage.objects
  for select to authenticated
  using (bucket_id = 'uploads');
