'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, CheckCircle2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/use-task-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useUserStore } from '@/store/use-user-store'
import { getUserTasks } from '@/lib/api'
import { useEffect, useState } from 'react'

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
}

export default function MyTasksPage() {
    const { openCreateDialog, openDrawer } = useTaskStore()
    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useUserStore()
    const [myTasks, setMyTasks] = useState<any[]>([])

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            if (currentWorkspace?.id && user?.id) {
                try {
                    const data = await getUserTasks(currentWorkspace.id, user.id)
                    setMyTasks(data || [])
                } catch (error) {
                    console.error("Failed to fetch my tasks", error)
                }
            }
        }
        fetchTasks()
    }, [currentWorkspace?.id, user?.id])

    // Group tasks by section
    const sections = [
        {
            id: 'today',
            title: 'Today',
            tasks: myTasks.filter(task => { // Naive "Today" check or improve with date libs
                if (!task.due_date) return false
                const today = new Date().toISOString().split('T')[0]
                return task.due_date.startsWith(today)
            })
        },
        {
            id: 'upcoming',
            title: 'Upcoming',
            tasks: myTasks.filter(task => {
                if (!task.due_date) return true // Treat no-date as upcoming or separate?
                const today = new Date().toISOString().split('T')[0]
                return task.due_date > today
            })
        },
        {
            id: 'later',
            title: 'Later',
            tasks: [] // Implement specific logic if needed
        }
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">My Tasks</h1>
                <Button
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </div>

            <div className="space-y-6">
                {sections.map((section) => (
                    <Card key={section.id}>
                        <CardHeader>
                            <CardTitle className="text-base">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {section.tasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground p-2">No tasks</p>
                                )}
                                {section.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 hover:shadow-sm cursor-pointer transition-all duration-200"
                                        onClick={() => openDrawer(task)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {task.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">{task.project?.name || 'No Project'}</span>
                                                {task.due_date && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn('text-xs font-normal', priorityColors[task.priority as keyof typeof priorityColors || 'medium'])}
                                        >
                                            {task.priority || 'medium'}
                                        </Badge>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={openCreateDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Task
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
