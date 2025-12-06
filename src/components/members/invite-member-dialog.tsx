'use client'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Mail } from 'lucide-react'
import { addMemberByEmail } from '@/lib/api'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { toast } from 'sonner'

interface InviteMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'admin' | 'member'>('member')
    const [loading, setLoading] = useState(false)
    const { currentWorkspace } = useWorkspaceStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !currentWorkspace) return

        setLoading(true)
        try {
            await addMemberByEmail(currentWorkspace.id, email)
            toast.success("Member added successfully")
            setEmail('')
            setRole('member')
            onOpenChange(false)
        } catch (error: any) {
            console.error('Failed to invite member:', error)
            if (error.message === 'User not found') {
                toast.error("User not found. Ask them to sign up first.")
            } else if (error.message === 'User is already a member') {
                toast.error("User is already a member of this workspace")
            } else {
                toast.error("Failed to add member")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite Member via Email</DialogTitle>
                    <DialogDescription>
                        Send an email invitation to join your organization workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                They will receive an email with instructions to join.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select value={role} onValueChange={(value: any) => setRole(value)}>
                                <SelectTrigger id="invite-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {role === 'admin'
                                    ? 'Admins can manage members and organization settings.'
                                    : 'Members can view and collaborate on projects.'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !email}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
