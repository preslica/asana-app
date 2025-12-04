-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users (handled by Supabase Auth, but we need a public profile)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  title text,
  location text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workspaces
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.users(id) not null,
  created_at timestamptz default now()
);

-- Workspace Members
create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) not null,
  user_id uuid references public.users(id) not null,
  role text default 'member', -- 'owner', 'admin', 'member', 'guest'
  primary key (workspace_id, user_id)
);

-- Teams
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Projects
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  team_id uuid references public.teams(id),
  name text not null,
  description text,
  view_type text default 'list', -- 'list', 'board', 'calendar', 'timeline'
  is_private boolean default false,
  owner_id uuid references public.users(id) not null,
  created_at timestamptz default now()
);

-- Sections (Columns in Board view, Sections in List view)
create table public.sections (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) not null,
  name text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Tasks
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  project_id uuid references public.projects(id),
  section_id uuid references public.sections(id),
  parent_id uuid references public.tasks(id), -- For subtasks
  name text not null,
  description text, -- Rich text content
  assignee_id uuid references public.users(id),
  due_date timestamptz,
  start_date timestamptz,
  priority text default 'medium', -- 'low', 'medium', 'high'
  status text default 'todo',
  order_index integer default 0,
  created_by uuid references public.users(id) not null,
  created_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) not null,
  user_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS Policies

-- Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Workspaces
alter table public.workspaces enable row level security;
create policy "Users can view workspaces they are members of" on public.workspaces for select using (
  exists (select 1 from public.workspace_members where workspace_id = id and user_id = auth.uid())
);
create policy "Users can create workspaces" on public.workspaces for insert with check (auth.uid() = owner_id);

-- Workspace Members
alter table public.workspace_members enable row level security;
create policy "Members can view other members in same workspace" on public.workspace_members for select using (
  exists (
    select 1 from public.workspace_members wm 
    where wm.workspace_id = workspace_members.workspace_id 
    and wm.user_id = auth.uid()
  )
);

-- Projects
alter table public.projects enable row level security;
create policy "Users can view projects in their workspaces" on public.projects for select using (
  exists (select 1 from public.workspace_members where workspace_id = projects.workspace_id and user_id = auth.uid())
);

-- Tasks
alter table public.tasks enable row level security;
create policy "Users can view tasks in their workspaces" on public.tasks for select using (
  exists (select 1 from public.workspace_members where workspace_id = tasks.workspace_id and user_id = auth.uid())
);

-- Trigger to create public user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
