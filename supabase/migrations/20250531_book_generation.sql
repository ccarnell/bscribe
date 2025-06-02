-- Simple schema for book generation
create table book_generations (
  id uuid primary key default gen_random_uuid(),
  status text default 'draft',
  title text,
  subtitle text,
  chapters jsonb default '[]'::jsonb,
  current_step text default 'title',
  created_at timestamptz default now()
);

-- Add RLS
alter table book_generations enable row level security;

-- Allow all operations for now (we'll secure later)
create policy "Enable all operations for book_generations" on book_generations
  for all using (true);

  -- Allow inserts without authentication for now
create policy "Allow anonymous inserts" on book_generations
  for insert with check (true);
  
-- Allow selects without authentication for now  
create policy "Allow anonymous selects" on book_generations
  for select using (true);

-- Temporarily disable RLS for testing
alter table book_generations disable row level security;