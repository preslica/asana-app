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
import { Search } from 'lucide-react'

interface AddMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState('')
    const [role, setRole] = useState<'admin' | 'member'>('member')

    // Mock users - replace with actual user search
    const availableUsers = [
        { id: '1', name: 'Sarah Wilson', email: 'sarah@example.com' },
        { id: '2', name: 'Mike Chen', email: 'mike@example.com' },
        { id: '3', name: 'Emma Davis', email: 'emma@example.com' },
    ].filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser) return

        // TODO: Add member to organization via API
        console.log('Adding member:', { userId: selectedUser, role })

        // Reset and close
        setSearchQuery('')
        setSelectedUser('')
        setRole('member')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Member to Organization</DialogTitle>
                    <DialogDescription>
                        Add an existing user to your organization workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="search">Search Users</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {searchQuery && (
                            <div className="grid gap-2">
                                <Label>Select User</Label>
                                <div className="border rounded-lg max-h-48 overflow-y-auto">
                                    {availableUsers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-4 text-center">
                                            No users found
                                        </p>
                                    ) : (
                                        availableUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => setSelectedUser(user.id)}
                                                className={`w-full text-left p-3 hover:bg-accent transition-colors ${selectedUser === user.id ? 'bg-accent' : ''
                                                    }`}
                                            >
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(value: any) => setRole(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedUser}>
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
