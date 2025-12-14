/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Use the RPC for atomic creation
    const { data: workspace, error } = await supabase
        .rpc('create_workspace_safe', { name: data.name })

    if (error) throw error

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

export async function getCurrentProfile() {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

    if (error) {
        // If profile not found, try to create it using auth data (Self-healing)
        if (error.code === 'PGRST116') { // PGRST116 is JSON object not found (single result)
            console.log("Profile not found, attempting to create...")
            const { data: newProfile, error: createError } = await supabase
                .from("users")
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url
                }])
                .select()
                .single()

            if (createError) {
                console.error("Failed to create profile:", createError)
                return null
            }
            return newProfile
        }

        console.error("Error fetching profile:", error)
        return null
    }

    return data
}

export async function getUserTasks(workspaceId: string, userId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            project:projects(name),
            assignee:users(full_name, avatar_url)
        `)
        .eq("workspace_id", workspaceId)
        .eq("assignee_id", userId)
        .order("due_date", { ascending: true })

    if (error) throw error
    return data
}

export async function getRecentActivity(workspaceId: string, _userId: string) {
    const supabase = createSupabaseClient()
    // Fetch comments on tasks assigned to the user or created by the user
    // This is a simplified "Inbox" based on comments.
    const { data, error } = await supabase
        .from("comments")
        .select(`
            *,
            task:tasks!inner(
                id, 
                name, 
                assignee_id, 
                created_by,
                project:projects(name)
            ),
            user:users(full_name, avatar_url)
        `)
        .eq("task.workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20)

    if (error) throw error
    // Filter client-side for relevance if needed, or refine query
    return data
}

export async function getCompletedTasks(workspaceId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            project:projects(name),
            assignee:users(full_name, avatar_url)
        `)
        .eq("workspace_id", workspaceId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(100) // Limit to last 100 for performance

    if (error) throw error
    return data
}

export async function getWorkspaceTasks(workspaceId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            assignee:users(id)
        `)
        .eq("workspace_id", workspaceId)

    if (error) throw error
    return data
}

export async function getTask(taskId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            project:projects(name),
            assignee:users(full_name, avatar_url)
        `)
        .eq("id", taskId)
        .single()

    if (error) throw error
    return data
}

export async function updateTask(taskId: string, updates: any) {
    const supabase = createSupabaseClient()

    // Normalize updates if needed (e.g. camelCase to snake_case)
    const dbUpdates: any = { ...updates }
    if (updates.dueDate) {
        dbUpdates.due_date = updates.dueDate
        delete dbUpdates.dueDate
    }

    const { data, error } = await supabase
        .from("tasks")
        .update(dbUpdates)
        .eq("id", taskId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getSubtasks(taskId: string) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            assignee:users(full_name, avatar_url)
        `)
        .eq("parent_id", taskId)
        .order("created_at", { ascending: true })

    if (error) throw error
    return data
}

export async function createSubtask(parentId: string, name: string, assignedTo?: string) {
    const supabase = createSupabaseClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error("Not authenticated")

    const { data: parent } = await supabase.from("tasks").select("workspace_id").eq("id", parentId).single()
    if (!parent) throw new Error("Parent task not found")

    const { data, error } = await supabase
        .from("tasks")
        .insert([{
            name,
            parent_id: parentId,
            workspace_id: parent.workspace_id,
            created_by: user.id,
            status: 'todo',
            assignee_id: assignedTo
        }])
        .select(`*, assignee:users(full_name, avatar_url)`)
        .single()

    if (error) throw error
    return data
}
