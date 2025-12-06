-- Consolidated Fix for Auth, Users, and Workspaces

-- 1. Fix User Profile Trigger
-- Drop existing trigger if it exists to ensure we have the latest version
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Fix RLS for Users Table
-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can create their own profile" on public.users;
drop policy if exists "Users can view profiles of members in their workspaces" on public.users;

-- Enable RLS
alter table public.users enable row level security;

-- Policy: Users can see their own profile
create policy "Users can view their own profile" 
on public.users for select 
using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update their own profile" 
on public.users for update 
using (auth.uid() = id);

-- Policy: Users can insert their own profile (healing)
create policy "Users can create their own profile" 
on public.users for insert 
with check (auth.uid() = id);

-- Policy: Users can view profiles of other workspace members (for collaboration)
-- Using a security definer function to avoid infinite recursion in policies
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

create policy "Users can view team members" 
on public.users for select 
using (
  exists (
    select 1 
    from public.workspace_members wm
    where wm.user_id = users.id
    and exists (
      select 1 
      from public.workspace_members my_wm 
      where my_wm.workspace_id = wm.workspace_id 
      and my_wm.user_id = auth.uid()
    )
  )
);

-- 3. Atomic Workspace Creation (RPC)
-- This function creates a workspace AND adds the owner in a single transaction
create or replace function public.create_workspace_safe(name text)
returns json as $$
declare
  new_workspace_id uuid;
  new_workspace json;
begin
  -- Insert Workspace
  insert into public.workspaces (name, owner_id)
  values (name, auth.uid())
  returning id into new_workspace_id;

  -- Insert Member (Owner)
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');

  -- Return the workspace object
  select row_to_json(w) into new_workspace
  from public.workspaces w
  where w.id = new_workspace_id;

  return new_workspace;
end;
$$ language plpgsql security definer;

-- 4. Fix RLS for Workspaces & Members
drop policy if exists "Users can view workspaces they are members of" on public.workspaces;
drop policy if exists "Users can create workspaces" on public.workspaces;

create policy "Users can view workspaces they are members of" 
on public.workspaces for select 
using (
  auth.uid() = owner_id or
  exists (
    select 1 from public.workspace_members 
    where workspace_id = id 
    and user_id = auth.uid()
  )
);

create policy "Users can create workspaces" 
on public.workspaces for insert 
with check (auth.uid() = owner_id);

drop policy if exists "Members can view other members in same workspace" on public.workspace_members;

create policy "Members can view other members in same workspace" 
on public.workspace_members for select 
using (
  exists (
    select 1 from public.workspace_members wm 
    where wm.workspace_id = workspace_members.workspace_id 
    and wm.user_id = auth.uid()
  )
);
