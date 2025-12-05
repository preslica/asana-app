-- Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id) NOT NULL,
    name text NOT NULL,
    email text,
    budget numeric,
    tier text DEFAULT 'low', -- 'low', 'medium', 'high'
    website text,
    drive_link text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view clients in their workspaces" ON public.clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE workspace_id = clients.workspace_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create clients in their workspaces" ON public.clients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE workspace_id = clients.workspace_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clients in their workspaces" ON public.clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE workspace_id = clients.workspace_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clients in their workspaces" ON public.clients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE workspace_id = clients.workspace_id 
            AND user_id = auth.uid()
        )
    );
