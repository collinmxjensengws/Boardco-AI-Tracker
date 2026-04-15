-- Run this in your Supabase SQL editor

create table if not exists task_completions (
  id uuid default gen_random_uuid() primary key,
  member_email text not null,
  task_id text not null,
  completed_at timestamp with time zone default now(),
  constraint unique_member_task unique (member_email, task_id)
);

-- Enable Row Level Security
alter table task_completions enable row level security;

-- Public read
create policy "Public read"
  on task_completions for select using (true);

-- Public insert
create policy "Public insert"
  on task_completions for insert with check (true);

-- Public delete (for unchecking)
create policy "Public delete"
  on task_completions for delete using (true);

-- Enable realtime
alter publication supabase_realtime add table task_completions;
