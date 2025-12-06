-- Allow users to insert their own profile (fallback for failed triggers)
drop policy if exists "Users can create their own profile" on public.users;
create policy "Users can create their own profile"
on public.users for insert
with check (auth.uid() = id);

-- Ensure users can update their own profile (in case it was missing)
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);
