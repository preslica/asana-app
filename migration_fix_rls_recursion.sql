-- Fix Infinite Recursion in RLS Policies
-- The issue is that the policy for "workspace_members" queries "workspace_members", causing an infinite loop.
-- We fix this by creating a SECURITY DEFINER function that bypasses RLS for the membership check.

-- 1. Create a helper function to check membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Members can view other members in same workspace" ON public.workspace_members;

-- 3. Create a new policy using the helper function
-- Even though the function bypasses RLS, we are only allowing users to see members 
-- of workspaces they effectively belong to, so it is secure.
CREATE POLICY "Members can view other members in same workspace" ON public.workspace_members
FOR SELECT USING (
  is_workspace_member(workspace_id)
);

-- 4. Optional: Optimize other policies to use this function (better performance + cleaner)
-- Workspaces
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of" ON public.workspaces
FOR SELECT USING (
  is_workspace_member(id)
);

-- Projects
DROP POLICY IF EXISTS "Users can view projects in their workspaces" ON public.projects;
CREATE POLICY "Users can view projects in their workspaces" ON public.projects
FOR SELECT USING (
  is_workspace_member(workspace_id)
);

-- Tasks
DROP POLICY IF EXISTS "Users can view tasks in their workspaces" ON public.tasks;
CREATE POLICY "Users can view tasks in their workspaces" ON public.tasks
FOR SELECT USING (
  is_workspace_member(workspace_id)
);

-- Clients
DROP POLICY IF EXISTS "Users can view clients in their workspaces" ON public.clients;
CREATE POLICY "Users can view clients in their workspaces" ON public.clients
FOR SELECT USING (
  is_workspace_member(workspace_id)
);

-- Note: We only updated SELECT policies for now as those are most read-heavy. 
-- The INSERT/UPDATE policies typically check specific conditions or are already handled.
-- For stricter consistency, you can update them too, but the SELECT policy recursion was the main crash cause.
