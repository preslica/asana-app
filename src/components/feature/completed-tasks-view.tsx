'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

// Mock data - replace with real data from store/backend
const completedTasks = [
    { id: '1', name: 'Design System Update', completedAt: new Date(), assignee: { name: 'Alice Smith', avatar: '/placeholder.jpg' }, project: 'Design' },
    { id: '2', name: 'Q4 Marketing Plan', completedAt: new Date(Date.now() - 86400000), assignee: { name: 'John Doe', avatar: '/placeholder-user.jpg' }, project: 'Marketing' },
    { id: '3', name: 'Fix Navigation Bug', completedAt: new Date(Date.now() - 172800000), assignee: { name: 'Bob Jones', avatar: '/placeholder.jpg' }, project: 'Engineering' },
    { id: '4', name: 'Client Meeting Prep', completedAt: new Date(), assignee: { name: 'John Doe', avatar: '/placeholder-user.jpg' }, project: 'Sales' },
]

export function CompletedTasksView() {
    const [filter, setFilter] = useState<'org' | 'me'>('org')

    const filteredTasks = filter === 'org'
        ? completedTasks
        : completedTasks.filter(t => t.assignee.name === 'John Doe') // Mock current user

    const groupedTasks = filteredTasks.reduce((acc, task) => {
        const dateKey = format(task.completedAt, 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(task)
        return acc
    }, {} as Record<string, typeof completedTasks>)

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
                                    {tasks.map((task) => (
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
