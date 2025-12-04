"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Client {
    id: string
    name: string
    website: string
    drive_link: string
    budget: number
    description: string
    tier: string
}

interface ClientDialogProps {
    children: React.ReactNode
    workspaceId: string
    client?: Client
    onSuccess?: () => void
}

export function ClientDialog({ children, workspaceId, client, onSuccess }: ClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: client?.name || "",
        website: client?.website || "",
        drive_link: client?.drive_link || "",
        budget: client?.budget?.toString() || "",
        description: client?.description || "",
        tier: client?.tier || "low",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (client) {
                // TODO: Implement updateClient server action
                console.log("Updating client", { ...formData, id: client.id })
                // Mock update
            } else {
                await createClient({ ...formData, workspace_id: workspaceId, budget: Number(formData.budget) })
            }

            setOpen(false)
            if (!client) {
                setFormData({ name: "", website: "", drive_link: "", budget: "", description: "", tier: "low" })
            }
            router.refresh()
            toast.success(client ? "Client updated successfully" : "Client created successfully")
            onSuccess?.()
        } catch (error: any) {
            console.error("Failed to save client", error)
            if (error.message?.includes('relation "public.clients" does not exist')) {
                toast.error("Database Error: Clients table missing. Please run the migration.")
            } else {
                toast.error("Failed to save client. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="drive_link">Google Drive Link</Label>
                        <Input
                            id="drive_link"
                            value={formData.drive_link}
                            onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                            id="budget"
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tier">Tier</Label>
                        <Select
                            value={formData.tier}
                            onValueChange={(value) => setFormData({ ...formData, tier: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : (client ? "Save Changes" : "Create Client")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
