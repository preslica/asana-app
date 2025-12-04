'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, CheckCircle2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/use-task-store'

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
}

export default function MyTasksPage() {
    const { tasks, openCreateDialog, openDrawer } = useTaskStore()

    // Mock current user
    const currentUser = { name: 'John Doe' }

    // Flatten tasks and assigned subtasks
    const allMyTasks = tasks.reduce((acc: any[], task) => {
        // Add task if assigned to user
        if (task.assignee?.name === currentUser.name) {
            acc.push(task)
        }

        // Add subtasks if assigned to user
        task.subtasks?.forEach(subtask => {
            if (subtask.assignee?.name === currentUser.name) {
                acc.push({
                    ...subtask,
                    id: subtask.id,
                    name: subtask.name,
                    priority: task.priority, // Inherit priority or default
                    project: task.project, // Inherit project
                    dueDate: 'No Date', // Subtasks might not have due dates yet
                    isSubtask: true,
                    parentTaskName: task.name,
                    parentId: task.id
                })
            }
        })

        return acc
    }, [])

    // Group tasks by section
    const sections = [
        {
            id: 'today',
            title: 'Today',
            tasks: allMyTasks.filter(task => task.dueDate === 'Today' || !task.dueDate)
        },
        {
            id: 'upcoming',
            title: 'Upcoming',
            tasks: allMyTasks.filter(task => task.dueDate && task.dueDate !== 'Today')
        },
        {
            id: 'later',
            title: 'Later',
            tasks: []
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
                                                {task.isSubtask && (
                                                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                                                        (Subtask of {task.parentTaskName})
                                                    </span>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">{task.project || 'Inbox'}</span>
                                                {task.dueDate && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{task.dueDate}</span>
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
