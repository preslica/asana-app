'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, CheckCheck, Archive } from 'lucide-react'

import { useState, useEffect } from 'react'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useUserStore } from '@/store/use-user-store'
import { getRecentActivity } from '@/lib/api'

const initialNotifications = [
    {
        id: '1',
        type: 'mention',
        user: { name: 'Alice Johnson', avatarUrl: '/placeholder.jpg' },
        message: 'mentioned you in',
        task: 'Review Q3 Roadmap',
        project: 'Marketing Campaign',
        time: '2 hours ago',
        unread: true,
    },
    {
        id: '2',
        type: 'assignment',
        user: { name: 'Bob Smith', avatarUrl: '/placeholder.jpg' },
        message: 'assigned you to',
        task: 'Update Design System',
        project: 'Product Launch',
        time: '5 hours ago',
        unread: true,
    },
    {
        id: '3',
        type: 'comment',
        user: { name: 'Charlie Brown', avatarUrl: '/placeholder.jpg' },
        message: 'commented on',
        task: 'Client Meeting Prep',
        project: 'Marketing Campaign',
        time: '1 day ago',
        unread: false,
    },
]

export default function InboxPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [filter, setFilter] = useState('all') // 'all', 'unread', etc.
    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useUserStore()

    useEffect(() => {
        const loadActivity = async () => {
            if (currentWorkspace?.id && user?.id) {
                try {
                    const data = await getRecentActivity(currentWorkspace.id, user.id)
                    // Transform to notification shape
                    const mapped = data?.map((item: any) => ({
                        id: item.id,
                        type: 'comment',
                        user: { name: item.user?.full_name || 'Unknown', avatarUrl: item.user?.avatar_url },
                        message: 'commented on',
                        task: item.task?.name,
                        project: item.task?.project?.name,
                        time: new Date(item.created_at).toLocaleString(),
                        unread: true // Logic for unread not yet fully implemented
                    })) || []
                    setNotifications(mapped)
                } catch (error) {
                    console.error("Failed to load inbox", error)
                }
            }
        }
        loadActivity()
    }, [currentWorkspace?.id, user?.id])

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }

    const archiveAll = () => {
        setNotifications([])
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bell className="h-6 w-6" />
                    <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
                    <Badge variant="secondary" className="rounded-full">
                        {notifications.filter(n => n.unread).length}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                    <Button variant="ghost" size="sm" onClick={archiveAll}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive all
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Archive className="h-10 w-10 mb-4 opacity-20" />
                            <p>Inbox is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={notification.unread ? 'border-l-4 border-l-primary' : ''}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={notification.user.avatarUrl} />
                                                <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{notification.user.name}</span>
                                                    {' '}{notification.message}{' '}
                                                    <span className="font-medium">{notification.task}</span>
                                                    {' '}in{' '}
                                                    <span className="text-muted-foreground">{notification.project}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                            </div>
                                            {notification.unread && (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="unread" className="mt-4">
                    <div className="space-y-2">
                        {notifications.filter(n => n.unread).length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                No unread notifications
                            </div>
                        ) : (
                            notifications.filter(n => n.unread).map((notification) => (
                                <Card key={notification.id} className="border-l-4 border-l-primary">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={notification.user.avatarUrl} />
                                                <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{notification.user.name}</span>
                                                    {' '}{notification.message}{' '}
                                                    <span className="font-medium">{notification.task}</span>
                                                    {' '}in{' '}
                                                    <span className="text-muted-foreground">{notification.project}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
