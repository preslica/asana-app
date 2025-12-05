import { createClient as createSupabaseClient } from "@/lib/supabase/client"

export async function createClient(clientData: any) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("clients")
        .insert([clientData])
        .select()

    if (error) throw error
    return data
}

export async function getClients(workspaceId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("clients")
        .select('*')
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function deleteClient(clientId: string) {
    const supabase = createSupabaseClient()
    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId)

    if (error) throw error
}

export async function getWorkspaces() {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("workspaces")
        .select(`
            *,
            members:workspace_members!inner(user_id)
        `)
        .eq("members.user_id", (await supabase.auth.getUser()).data.user?.id)

    if (error) throw error
    return data
}

export async function createWorkspace(data: { name: string }) {
    const supabase = createSupabaseClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error("Not authenticated")

    const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert([{
            name: data.name,
            owner_id: user.id
        }])
        .select()
        .single()

    if (error) throw error

    // Add creator as admin member
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert([{
            workspace_id: workspace.id,
            user_id: user.id,
            role: 'owner'
        }])

    if (memberError) throw memberError

    return workspace
}

export async function getWorkspaceMembers(workspaceId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("workspace_members")
        .select(`
            role,
            user:users (
                id,
                email,
                full_name,
                avatar_url
            )
        `)
        .eq("workspace_id", workspaceId)

    if (error) throw error
    return data
}

export async function addMemberByEmail(workspaceId: string, email: string) {
    const supabase = createSupabaseClient()

    // 1. Find user by email
    const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

    if (userError || !users) throw new Error("User not found")

    // 2. Add to workspace
    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert([{
            workspace_id: workspaceId,
            user_id: users.id,
            role: 'member'
        }])

    if (memberError) {
        if (memberError.code === '23505') throw new Error("User is already a member")
        throw memberError
    }
}

export async function removeMember(workspaceId: string, userId: string) {
    const supabase = createSupabaseClient()
    const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)

    if (error) throw error
}

export async function updateMemberRole(workspaceId: string, userId: string, role: string) {
    const supabase = createSupabaseClient()
    const { error } = await supabase
        .from("workspace_members")
        .update({ role })
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)

    if (error) throw error
}
// ... existing methods
export async function getProjects(workspaceId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("projects")
        .select('*')
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function createProject(workspaceId: string, data: { name: string, color: string, description?: string, icon?: string }) {
    const supabase = createSupabaseClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error("Not authenticated")

    const { data: project, error } = await supabase
        .from("projects")
        .insert([{
            ...data,
            workspace_id: workspaceId,
            owner_id: user.id
        }])
        .select()
        .single()

    if (error) throw error
    return project
}

export async function updateProject(projectId: string, updates: any) {
    const supabase = createSupabaseClient()
    const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)

    if (error) throw error
}

export async function deleteProject(projectId: string) {
    const supabase = createSupabaseClient()
    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

    if (error) throw error
}
