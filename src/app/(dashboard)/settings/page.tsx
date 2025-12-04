'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Lock, Bell, Palette, Upload, Plus, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateProfile, updateEmail, updatePassword } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { AddMemberDialog } from '@/components/members/add-member-dialog'
import { InviteMemberDialog } from '@/components/members/invite-member-dialog'


export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [colorScheme, setColorScheme] = useState('default')
    const [notifications, setNotifications] = useState({
        taskAssignments: true,
        mentions: true,
        dueDates: true,
        projectUpdates: false,
    })
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Mock members state
    const [members, setMembers] = useState([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', avatar: '/placeholder-user.jpg' },
        { id: '2', name: 'Alice Smith', email: 'alice@example.com', role: 'member', avatar: '/placeholder.jpg' },
        { id: '3', name: 'Bob Jones', email: 'bob@example.com', role: 'member', avatar: '/placeholder.jpg' },
    ])

    const handleDeleteMember = (id: string) => {
        if (confirm('Are you sure you want to remove this member?')) {
            setMembers(members.filter(m => m.id !== id))
            setMessage({ type: 'success', text: 'Member removed successfully' })
        }
    }

    const handleRoleChange = (id: string, newRole: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m))
        setMessage({ type: 'success', text: 'Member role updated' })
    }

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        }
        setLoading(false)
    }

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const newEmail = formData.get('email') as string
        const result = await updateEmail(newEmail)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: result.message || 'Email updated!' })
        }
        setLoading(false)
    }

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('new_password') as string
        const confirmPassword = formData.get('confirm_password') as string

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            setLoading(false)
            return
        }

        const result = await updatePassword(newPassword)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully!' })
        }
        setLoading(false)
    }

    const { setTheme, theme } = useTheme()

    // Apply color scheme to document
    React.useEffect(() => {
        const root = document.documentElement
        // Remove all theme classes
        root.classList.remove('theme-default', 'theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-pink')
        // Add selected theme
        root.classList.add(`theme-${colorScheme}`)
        // Save to localStorage
        localStorage.setItem('color-scheme', colorScheme)
    }, [colorScheme])

    // Load color scheme from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('color-scheme')
        if (saved) {
            setColorScheme(saved)
        }
    }, [])

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg py-2">Profile</TabsTrigger>
                    <TabsTrigger value="account" className="rounded-lg py-2">Account</TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-lg py-2">Preferences</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg py-2">Notifications</TabsTrigger>
                    <TabsTrigger value="members" className="rounded-lg py-2">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and how others see you
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-8">
                                <div className="flex items-center gap-8">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                                        <AvatarImage src={avatarPreview || "/placeholder-user.jpg"} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        setMessage({ type: 'error', text: 'File size must be less than 2MB' })
                                                        return
                                                    }
                                                    const reader = new FileReader()
                                                    reader.onloadend = () => {
                                                        setAvatarPreview(reader.result as string)
                                                    }
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            JPG, PNG or GIF. Max size 2MB.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            placeholder="John Doe"
                                            defaultValue="John Doe"
                                            className="max-w-md"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title / Role</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Product Manager"
                                            className="max-w-md"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                            className="max-w-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 max-w-xl">
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                placeholder="San Francisco, CA"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="url"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Email Address</CardTitle>
                            <CardDescription>
                                Change your email address. You'll need to verify the new email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-md">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">New Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="newemail@example.com"
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Email'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div className="grid gap-2">
                                    <Label htmlFor="new_password">New Password</Label>
                                    <Input
                                        id="new_password"
                                        name="new_password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm_password">Confirm Password</Label>
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions that affect your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize how TaskApp looks for you
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid gap-4">
                                <Label className="text-base">Theme</Label>
                                <div className="grid grid-cols-3 gap-4 max-w-md">
                                    {['light', 'dark', 'system'].map((t) => (
                                        <Button
                                            key={t}
                                            variant={theme === t ? 'default' : 'outline'}
                                            className="justify-start capitalize"
                                            onClick={() => setTheme(t)}
                                        >
                                            <Palette className="mr-2 h-4 w-4" />
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4">
                                <Label className="text-base">Color Scheme</Label>
                                <div className="grid grid-cols-6 gap-4 max-w-2xl">
                                    {[
                                        { name: 'default', color: 'bg-gray-900' },
                                        { name: 'blue', color: 'bg-blue-500' },
                                        { name: 'purple', color: 'bg-purple-500' },
                                        { name: 'green', color: 'bg-green-500' },
                                        { name: 'orange', color: 'bg-orange-500' },
                                        { name: 'pink', color: 'bg-pink-500' },
                                    ].map((scheme) => (
                                        <button
                                            key={scheme.name}
                                            type="button"
                                            onClick={() => setColorScheme(scheme.name)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105",
                                                colorScheme === scheme.name ? "border-primary ring-2 ring-primary/20" : "hover:border-primary"
                                            )}
                                        >
                                            <div className={`h-12 w-12 rounded-full ${scheme.color} shadow-sm`} />
                                            <span className="text-xs font-medium capitalize">{scheme.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose what notifications you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { key: 'taskAssignments', title: 'Task Assignments', description: 'Receive email when someone assigns you a task' },
                                { key: 'mentions', title: 'Mentions', description: 'Receive email when someone mentions you in a comment' },
                                { key: 'dueDates', title: 'Due Dates', description: 'Receive email reminders for upcoming due dates' },
                                { key: 'projectUpdates', title: 'Project Updates', description: 'Receive email updates on projects you follow' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notifications[item.key as keyof typeof notifications]}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Workspace Members</CardTitle>
                            <CardDescription>
                                Manage members and their roles. Admins can manage other members.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={member.role}
                                                onValueChange={(value) => handleRoleChange(member.id, value)}
                                            >
                                                <SelectTrigger className="w-[110px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                                <Button
                                    className="flex-1 sm:flex-none"
                                    variant="outline"
                                    onClick={() => setIsAddMemberOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Member
                                </Button>
                                <Button
                                    className="flex-1 sm:flex-none"
                                    onClick={() => setIsInviteMemberOpen(true)}
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Invite Member
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Member Management Dialogs */}
            <AddMemberDialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} />
            <InviteMemberDialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen} />
        </div>
    )
}
