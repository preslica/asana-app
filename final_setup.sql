-- ==========================================
-- FINAL SETUP SCRIPT FOR TASKAPP
-- ==========================================
-- Run this script in the Supabase SQL Editor to reset/setup your database.
-- WARNING: This will drop existing tables and data in the public schema!

-- 1. Helper to clean up
drop table if exists public.comments cascade;
drop table if exists public.tasks cascade;
drop table if exists public.sections cascade;
drop table if exists public.projects cascade;
drop table if exists public.teams cascade;
drop table if exists public.clients cascade; -- Added clients
drop table if exists public.workspace_members cascade;
drop table if exists public.workspaces cascade;
drop table if exists public.users cascade;

-- 2. Extensions
create extension if not exists "uuid-ossp";

-- 3. Tables

-- Users
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
  role text default 'member', 
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
  view_type text default 'list',
  is_private boolean default false,
  owner_id uuid references public.users(id) not null,
  created_at timestamptz default now()
);

-- Sections
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
  parent_id uuid references public.tasks(id),
  name text not null,
  description text,
  assignee_id uuid references public.users(id),
  due_date timestamptz,
  start_date timestamptz,
  priority text default 'medium',
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

-- Clients (Added)
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  name text not null,
  email text,
  status text default 'active',
  created_at timestamptz default now()
);

-- 4. Functions & Triggers

-- Handle New User (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4b. Backfill existing users (CRITICAL for valid FKs)
insert into public.users (id, email, full_name, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;

-- Helper: Is Workspace Member?
drop function if exists public.is_workspace_member(uuid) cascade; -- Added cascade
create or replace function public.is_workspace_member(workspace_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 
    from public.workspace_members 
    where workspace_id = $1 
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- RPC: Create Workspace Safe (Transactions)
drop function if exists public.create_workspace_safe(text) cascade; -- Added cascade
create or replace function public.create_workspace_safe(name text)
returns json as $$
declare
  new_workspace_id uuid;
  new_workspace json;
begin
  insert into public.workspaces (name, owner_id)
  values (name, auth.uid())
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');

  select row_to_json(w) into new_workspace
  from public.workspaces w
  where w.id = new_workspace_id;

  return new_workspace;
end;
$$ language plpgsql security definer;

-- 5. RLS Policies

-- Enable RLS
alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.teams enable row level security;
alter table public.projects enable row level security;
alter table public.sections enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.clients enable row level security; -- Added

-- Users Logic
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);
create policy "Users can create their own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can view team members" on public.users for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.user_id = users.id
    and exists (
      select 1 from public.workspace_members my_wm 
      where my_wm.workspace_id = wm.workspace_id 
      and my_wm.user_id = auth.uid()
    )
  )
);

-- Workspaces Logic
create policy "Users can view workspaces they given access to" on public.workspaces for select using (
  auth.uid() = owner_id or
  exists (
    select 1 from public.workspace_members 
    where workspace_id = id 
    and user_id = auth.uid()
  )
);
create policy "Users can create workspaces" on public.workspaces for insert with check (auth.uid() = owner_id);

-- Members Logic
create policy "Members can view other members in same workspace" on public.workspace_members for select using (
  exists (
    select 1 from public.workspace_members wm 
    where wm.workspace_id = workspace_members.workspace_id 
    and wm.user_id = auth.uid()
  )
);
create policy "Admins can add members" on public.workspace_members for insert with check (
  exists (
    select 1 from public.workspace_members 
    where workspace_id = workspace_members.workspace_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
  )
);

-- Data Tables Logic (Simple Hierarchical Check)
-- Projects
create policy "View projects in workspace" on public.projects for select using (
  exists (select 1 from public.workspace_members where workspace_id = projects.workspace_id and user_id = auth.uid())
);
create policy "Create projects in workspace" on public.projects for insert with check (
  exists (select 1 from public.workspace_members where workspace_id = projects.workspace_id and user_id = auth.uid())
);
create policy "Update projects in workspace" on public.projects for update using (
  exists (select 1 from public.workspace_members where workspace_id = projects.workspace_id and user_id = auth.uid())
);
create policy "Delete projects in workspace" on public.projects for delete using (
  owner_id = auth.uid()
);

-- Tasks
create policy "View tasks in workspace" on public.tasks for select using (
  exists (select 1 from public.workspace_members where workspace_id = tasks.workspace_id and user_id = auth.uid())
);
create policy "Manage tasks in workspace" on public.tasks for all using (
  exists (select 1 from public.workspace_members where workspace_id = tasks.workspace_id and user_id = auth.uid())
);

-- Comments
create policy "View comments in workspace" on public.comments for select using (
  exists (
    select 1 from public.tasks t
    join public.workspace_members wm on wm.workspace_id = t.workspace_id
    where t.id = comments.task_id
    and wm.user_id = auth.uid()
  )
);
create policy "Create comments in workspace" on public.comments for insert with check (
  exists (
    select 1 from public.tasks t
    join public.workspace_members wm on wm.workspace_id = t.workspace_id
    where t.id = comments.task_id
    and wm.user_id = auth.uid()
  )
);

-- Clients
create policy "View clients in workspace" on public.clients for select using (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);
create policy "Manage clients in workspace" on public.clients for all using (
  exists (select 1 from public.workspace_members where workspace_id = clients.workspace_id and user_id = auth.uid())
);

