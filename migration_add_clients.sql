-- Create Clients Table
create table if not exists public.clients (
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

-- RLS Policies for Clients
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
