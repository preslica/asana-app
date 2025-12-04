'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function CreateWorkspacePage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('You must be logged in to create a workspace')
            setLoading(false)
            return
        }

        // 1. Create Workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .insert({
                name,
                owner_id: user.id,
            })
            .select()
            .single()

        if (workspaceError) {
            setError(workspaceError.message)
            setLoading(false)
            return
        }

        // 2. Add creator as member (owner)
        const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: 'owner',
            })

        if (memberError) {
            setError(memberError.message)
            setLoading(false)
            return
        }

        router.push(`/workspace/${workspace.id}`)
        router.refresh()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Create Workspace</CardTitle>
                    <CardDescription>
                        Give your workspace a name to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateWorkspace} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="name">Workspace Name</label>
                            <Input
                                id="name"
                                placeholder="Acme Corp"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {error && <div className="text-sm text-red-500">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Workspace'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
