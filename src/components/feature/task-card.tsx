import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Paperclip, MessageSquare, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { useTaskStore } from '@/store/use-task-store'
import { useState } from 'react'
import { toast } from "sonner"

interface TaskCardProps {
    task: {
        id: string
        name: string
        priority: 'low' | 'medium' | 'high'
        dueDate?: string
        assignee?: {
            name: string
            avatarUrl?: string
        }
        tags?: string[]
        commentCount?: number
        attachmentCount?: number
        completed?: boolean
    }
}

const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

import { useHaptics } from '@/hooks/use-haptics'

export function TaskCard({ task }: TaskCardProps) {
    const { openDrawer, deleteTask, addTask, updateTask } = useTaskStore()
    const [isCompleted, setIsCompleted] = useState(task.completed || false)
    const { impact, ImpactStyle, notification, NotificationType } = useHaptics()

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't open drawer if clicking on context menu
        if ((e.target as HTMLElement).closest('[role="menuitem"]')) return
        openDrawer(task as any)
    }

    const handleMarkComplete = () => {
        setIsCompleted(!isCompleted)
        impact(ImpactStyle.Light)
        if (!isCompleted) {
            notification(NotificationType.Success)
        }
        // TODO: Update task in backend
        console.log('Task marked as', isCompleted ? 'incomplete' : 'complete')
    }

    const priorityColor = {
        low: 'border-l-blue-500',
        medium: 'border-l-yellow-500',
        high: 'border-l-red-500',
    }[task.priority]

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Card
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-all border-l-4",
                        priorityColor,
                        isCompleted && "opacity-60 bg-muted/50"
                    )}
                    onClick={handleCardClick}
                >
                    <CardHeader className="p-3 pb-2 space-y-0">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className={cn(
                                "text-sm font-semibold leading-tight line-clamp-2",
                                isCompleted && "line-through text-muted-foreground"
                            )}>
                                {task.name}
                            </h3>
                            {isCompleted && (
                                <div className="flex-shrink-0 text-green-600">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 pb-2">
                        <div className="flex flex-wrap gap-1">
                            {task.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between items-center text-muted-foreground">
                        <div className="flex items-center gap-3 text-xs">
                            {task.dueDate && (
                                <div className={cn("flex items-center gap-1",
                                    new Date(task.dueDate) < new Date() ? "text-red-500" : ""
                                )}>
                                    <Calendar className="h-3 w-3" />
                                    <span>{task.dueDate}</span>
                                </div>
                            )}
                            {(task.commentCount || 0) > 0 && (
                                <div className="flex items-center gap-1 hover:text-foreground">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{task.commentCount}</span>
                                </div>
                            )}
                            {(task.attachmentCount || 0) > 0 && (
                                <div className="flex items-center gap-1 hover:text-foreground">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{task.attachmentCount}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkComplete()
                                }}
                                className={cn(
                                    "p-1 rounded-full border transition-colors hover:bg-muted",
                                    isCompleted ? "bg-green-100 border-green-500 text-green-600" : "border-muted-foreground/30 text-muted-foreground"
                                )}
                                title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                            >
                                <Check className="h-3 w-3" />
                            </button>
                            {task.assignee && (
                                <Avatar className="h-5 w-5 border-2 border-background">
                                    <AvatarImage src={task.assignee.avatarUrl} />
                                    <AvatarFallback className="text-[10px]">{task.assignee.name[0]}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleMarkComplete}>
                    <Check className="mr-2 h-4 w-4" />
                    {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                    <ContextMenuSubTrigger>Priority</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem onClick={() => {
                            updateTask(task.id, { priority: 'low' })
                            toast.success("Priority changed to low")
                        }}>
                            Low
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => {
                            updateTask(task.id, { priority: 'medium' })
                            toast.success("Priority changed to medium")
                        }}>
                            Medium
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => {
                            updateTask(task.id, { priority: 'high' })
                            toast.success("Priority changed to high")
                        }}>
                            High
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem onClick={() => {
                    const newTask = { ...task, id: crypto.randomUUID(), name: `${task.name} (Copy)` }
                    addTask(newTask)
                    toast.success("Task duplicated")
                }}>
                    Duplicate
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/task/${task.id}`)
                    toast.success("Link copied to clipboard")
                }}>
                    Copy Link
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive" onClick={() => {
                    deleteTask(task.id)
                    toast.success("Task deleted")
                }}>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
