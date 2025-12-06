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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, Link2, Mail, Trash2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useUserStore } from '@/store/use-user-store'
import { addMemberByEmail } from '@/lib/api'
import { toast } from 'sonner'

interface ShareDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
    const [email, setEmail] = useState('')
    const [permission, setPermission] = useState<'view' | 'edit'>('view')
    const [linkCopied, setLinkCopied] = useState(false)

    const projectLink = typeof window !== 'undefined' ? window.location.href : ''

    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useUserStore()

    const handleCopyLink = () => {
        navigator.clipboard.writeText(projectLink)
        setLinkCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const handleInvite = async () => {
        if (!email || !currentWorkspace) return

        try {
            await addMemberByEmail(currentWorkspace.id, email)
            toast.success("Invitation sent successfully")
            setEmail('')
        } catch (error: any) {
            console.error('Failed to invite:', error)
            toast.error(error.message || "Failed to send invitation")
        }
    }

    // For now, we don't list all 1000s of members here, but you could fetch them if needed.
    // const collaborators = ...

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                    <DialogDescription>
                        Share this project with your team or get a shareable link.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Copy Link Section */}
                    <div className="grid gap-3">
                        <Label>Share Link</Label>
                        <div className="flex gap-2">
                            <Input
                                value={projectLink}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCopyLink}
                            >
                                {linkCopied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Anyone with this link can view the project
                        </p>
                    </div>

                    {/* Invite by Email */}
                    <div className="grid gap-3">
                        <Label htmlFor="email">Invite by Email</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">View</SelectItem>
                                    <SelectItem value="edit">Edit</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={handleInvite} disabled={!email}>
                                <Mail className="h-4 w-4 mr-2" />
                                Invite
                            </Button>
                        </div>
                    </div>

                    {/* Current Collaborators - Hidden for now as it lists all workspace members */}
                    {/* <div className="grid gap-3">
                        <Label>Collaborators</Label>
                        ...
                    </div> */}
                </div>

                <DialogFooter>
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
