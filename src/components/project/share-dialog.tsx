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

interface ShareDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
    const [email, setEmail] = useState('')
    const [permission, setPermission] = useState<'view' | 'edit'>('view')
    const [linkCopied, setLinkCopied] = useState(false)

    const projectLink = typeof window !== 'undefined' ? window.location.href : ''

    const handleCopyLink = () => {
        navigator.clipboard.writeText(projectLink)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const handleInvite = () => {
        if (!email) return
        // TODO: Send invitation
        console.log('Inviting:', email, 'with permission:', permission)
        setEmail('')
    }

    // Mock collaborators
    const collaborators = [
        { id: '1', name: 'John Doe', email: 'john@example.com', permission: 'edit', avatar: '/placeholder.jpg' },
        { id: '2', name: 'Alice Smith', email: 'alice@example.com', permission: 'view', avatar: '/placeholder.jpg' },
    ]

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

                    {/* Current Collaborators */}
                    <div className="grid gap-3">
                        <Label>Collaborators ({collaborators.length})</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {collaborators.map((collab) => (
                                <div key={collab.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={collab.avatar} />
                                            <AvatarFallback>{collab.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{collab.name}</p>
                                            <p className="text-xs text-muted-foreground">{collab.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">
                                            {collab.permission}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
