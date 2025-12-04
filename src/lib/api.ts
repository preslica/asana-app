import { createClient as createSupabaseClient } from "@/lib/supabase/client"

const supabase = createSupabaseClient()

export async function createClient(clientData: any) {
    const { data, error } = await supabase
        .from("clients")
        .insert([clientData])
        .select()

    if (error) throw error
    return data
}

export async function getClients(workspaceId: string) {
    const { data, error } = await supabase
        .from("clients")
        .select('*')
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function deleteClient(clientId: string) {
    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId)

    if (error) throw error
}
