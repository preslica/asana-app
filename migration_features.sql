-- Clients Table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  name text not null,
  website text,
  drive_link text,
  budget numeric,
  description text,
  tier text default 'low', -- 'low', 'medium', 'high'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add client_id to projects
alter table public.projects 
add column client_id uuid references public.clients(id);

-- Time Entries Table
create table public.time_entries (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) not null,
  user_id uuid references public.users(id) not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds integer,
  description text,
  created_at timestamptz default now()
);

-- Add time tracking fields to tasks
alter table public.tasks
add column time_tracking_required boolean default false,
add column total_time_spent integer default 0; -- in seconds

-- RLS for Clients
alter table public.clients enable row level security;

create policy "Users can view clients in their workspaces" on public.clients for select using (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);

create policy "Users can create clients in their workspaces" on public.clients for insert with check (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);

create policy "Users can update clients in their workspaces" on public.clients for update using (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);

create policy "Users can delete clients in their workspaces" on public.clients for delete using (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);

-- RLS for Time Entries
alter table public.time_entries enable row level security;

create policy "Users can view time entries in their workspaces" on public.time_entries for select using (
  exists (
    select 1 from public.tasks t
    join public.workspace_members wm on wm.workspace_id = t.workspace_id
    where t.id = time_entries.task_id and wm.user_id = auth.uid()
  )
);

create policy "Users can insert time entries" on public.time_entries for insert with check (
  auth.uid() = user_id
);

create policy "Users can update their own time entries" on public.time_entries for update using (
  auth.uid() = user_id
);
