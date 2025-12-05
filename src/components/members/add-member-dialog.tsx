import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addMemberByEmail } from '@/lib/api'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/store/use-workspace-store'

interface AddMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onMemberAdded?: () => void
}

export function AddMemberDialog({ open, onOpenChange, onMemberAdded }: AddMemberDialogProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { currentWorkspace } = useWorkspaceStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !currentWorkspace) return

        setLoading(true)
        try {
            await addMemberByEmail(currentWorkspace.id, email)
            toast.success('Member added successfully')
            setEmail('')
            onOpenChange(false)
            onMemberAdded?.()
        } catch (error: any) {
            toast.error(error.message || 'Failed to add member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>
                        Add a user to <strong>{currentWorkspace?.name}</strong> by their email address.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !currentWorkspace}>
                            {loading ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
