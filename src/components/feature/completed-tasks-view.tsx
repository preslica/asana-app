'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { getCompletedTasks } from '@/lib/api'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useUserStore } from '@/store/use-user-store'
import { useEffect } from 'react'

export function CompletedTasksView() {
    const [filter, setFilter] = useState<'org' | 'me'>('org')
    const [tasks, setTasks] = useState<any[]>([])
    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useUserStore()

    useEffect(() => {
        if (currentWorkspace) {
            getCompletedTasks(currentWorkspace.id).then(data => {
                const mapped = data?.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    completedAt: t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at), // Fallback
                    assignee: {
                        id: t.assignee?.id,
                        name: t.assignee?.full_name || 'Unassigned',
                        avatar: t.assignee?.avatar_url
                    },
                    project: t.project?.name || 'No Project'
                })) || []
                setTasks(mapped)
            })
        }
    }, [currentWorkspace])

    const filteredTasks = filter === 'org'
        ? tasks
        : tasks.filter(t => t.assignee.id === user?.id)

    const groupedTasks = filteredTasks.reduce((acc: any, task: any) => {
        if (!task.completedAt) return acc
        const dateKey = format(task.completedAt, 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(task)
        return acc
    }, {} as Record<string, any[]>)

    return (
        <Card className="h-full border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Completed Tasks
                    </CardTitle>
                    <Tabs defaultValue="org" className="w-[200px]" onValueChange={(v) => setFilter(v as 'org' | 'me')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="org">Organization</TabsTrigger>
                            <TabsTrigger value="me">My Tasks</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-6">
                        {Object.entries(groupedTasks).sort((a, b) => b[0].localeCompare(a[0])).map(([date, tasks]) => (
                            <div key={date}>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-2 z-10">
                                    {format(new Date(date), 'EEEE, MMMM do')}
                                </h3>
                                <div className="space-y-2">
                                    {(tasks as any[]).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm line-through text-muted-foreground">{task.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{task.project}</span>
                                                        <span>•</span>
                                                        <span>{format(task.completedAt, 'h:mm a')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={task.assignee.avatar} />
                                                    <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(groupedTasks).length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No completed tasks found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
