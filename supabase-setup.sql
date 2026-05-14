-- Run this in your Supabase SQL editor

create table messages (
  id uuid default gen_random_uuid() primary key,
  name text,
  message text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Allow anyone to insert (but not read back)
create policy "Allow public insert" on messages
  for insert to anon with check (true);
