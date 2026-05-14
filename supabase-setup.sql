-- Run in Supabase SQL Editor
-- Safe to re-run

create table if not exists messages (
  id         uuid        default gen_random_uuid() primary key,
  name       text,
  message    text        not null,
  file_name  text,
  file_path  text,
  created_at timestamptz default now()
);

alter table messages enable row level security;

drop policy if exists "Allow public insert" on messages;
create policy "Allow public insert" on messages
  for insert to anon with check (true);

-- Storage bucket is auto-created by the Netlify function on first upload.
-- Run the lines below AFTER your first upload attempt:

-- drop policy if exists "Allow anon upload" on storage.objects;
-- create policy "Allow anon upload" on storage.objects
--   for insert to anon with check (bucket_id = 'uploads');
