"use client"

import { useEffect, useState } from "react"
import { ClientDialog } from "@/components/clients/client-dialog"
import { ClientImport } from "@/components/clients/client-import"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getClients, deleteClient } from "@/lib/api"
import { Plus, Trash2, ExternalLink, Pencil } from "lucide-react"
import { useWorkspaceStore } from "@/store/use-workspace-store"

export default function ClientsPage() {
    const { currentWorkspace } = useWorkspaceStore()
    const workspaceId = currentWorkspace?.id
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        try {
            const data = await getClients(workspaceId)
            setClients(data || [])
            setLoading(false)
        } catch (error) {
            console.error("Failed to load clients", error)
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client?")) return
        try {
            await deleteClient(id)
            loadClients()
        } catch (error) {
            console.error("Failed to delete client", error)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                <div className="flex items-center space-x-2">
                    {workspaceId && <ClientImport workspaceId={workspaceId} onSuccess={loadClients} />}
                    {workspaceId && (
                        <ClientDialog workspaceId={workspaceId} onSuccess={loadClients}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Client
                            </Button>
                        </ClientDialog>
                    )}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {clients.map((client) => (
                    <Card key={client.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {client.name}
                            </CardTitle>
                            <div className="flex gap-1">
                                <ClientDialog workspaceId={workspaceId} client={client} onSuccess={loadClients}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </ClientDialog>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(client.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${client.budget?.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {client.tier.toUpperCase()} Tier
                            </p>
                            <div className="mt-4 flex flex-col gap-2">
                                {client.website && (
                                    <a href={client.website} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center">
                                        Website <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                )}
                                {client.drive_link && (
                                    <a href={client.drive_link} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center">
                                        Drive Folder <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
