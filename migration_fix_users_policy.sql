-- Allow users to view profiles of other users in the same workspace
-- This is required to show team members' names and avatars in the UI

CREATE POLICY "Users can view profiles of members in their workspaces" ON public.users
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE user_id = users.id 
    AND public.is_workspace_member(workspace_id)
  )
);
