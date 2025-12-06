-- REPAIR SCRIPT: Sync Auth Users to Public Users
-- Run this if you get "foreign key constraint" errors or "user not found"

insert into public.users (id, email, full_name, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url;

-- Output success message
do $$
begin
  raise notice 'Users synced successfully from auth.users to public.users';
end $$;
