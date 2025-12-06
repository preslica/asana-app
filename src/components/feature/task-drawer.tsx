'use client'

import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Calendar,
    User,
    Tag,
    Paperclip,
    MessageSquare,
    CheckSquare,
    Trash2,
    CheckCircle2,
    Circle,
    Plus,
} from 'lucide-react'
import { useTaskStore } from '@/store/use-task-store'
import { useUserStore } from '@/store/use-user-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { getWorkspaceMembers, getTask, getSubtasks, updateTask as updateTaskApi, createSubtask } from '@/lib/api'
import { toast } from 'sonner' // Assuming sonner is installed/used

export function TaskDrawer() {
    const {
        isDrawerOpen,
        closeDrawer,
        selectedTask,
        updateTask: updateStoreTask // retain store update for optimistic or parent list update
    } = useTaskStore()

    const { user } = useUserStore()
    const { currentWorkspace } = useWorkspaceStore()

    // Local state for the full task details (including subtasks which aren't in the list view)
    const [taskDetails, setTaskDetails] = useState<any>(null)
    const [subtasks, setSubtasks] = useState<any[]>([])

    // Inputs
    const [newSubtaskName, setNewSubtaskName] = useState('')
    const [members, setMembers] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; timestamp: Date }>>([]) // Mock comments for now

    // Timer
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // 1. Fetch Members
    useEffect(() => {
        if (currentWorkspace) {
            getWorkspaceMembers(currentWorkspace.id).then(data => {
                const formattedMembers = data?.map((m: any) => ({
                    id: m.user.id,
                    name: m.user.full_name || 'Unnamed User',
                    email: m.user.email,
                    avatar: m.user.avatar_url,
                })) || []
                setMembers(formattedMembers)
            })
        }
    }, [currentWorkspace])

    // 2. Load Task Details on Open
    useEffect(() => {
        if (isDrawerOpen && selectedTask?.id) {
            // Initial render with passed data to avoid layout shift
            setTaskDetails(selectedTask)

            // Fetch fresh full details
            getTask(selectedTask.id).then(data => {
                if (data) setTaskDetails(data)
            }).catch(console.error)

            // Fetch Subtasks
            getSubtasks(selectedTask.id).then(data => {
                setSubtasks(data || [])
            }).catch(console.error)
        } else if (!isDrawerOpen) {
            // Cleanup on close
            setTaskDetails(null)
            setSubtasks([])
        }
    }, [isDrawerOpen, selectedTask])

    // Update Handler
    const handleUpdate = async (updates: any) => {
        if (!taskDetails?.id) return

        // Optimistic update
        setTaskDetails((prev: any) => ({ ...prev, ...updates }))

        try {
            await updateTaskApi(taskDetails.id, updates)
            // Also sync back to store so list view updates
            updateStoreTask(taskDetails.id, updates)
        } catch (error) {
            console.error("Update failed", error)
            toast.error("Failed to update task")
            // Revert? (Not implemented for MVP)
        }
    }

    const handleSubtaskToggle = async (subtaskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' || currentStatus === 'done' ? 'todo' : 'completed'

        // Optimistic
        setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, status: newStatus } : s))

        try {
            await updateTaskApi(subtaskId, { status: newStatus })
        } catch (error) {
            console.error("Subtask update failed", error)
        }
    }

    const handleAddSubtask = async () => {
        if (!newSubtaskName.trim() || !taskDetails?.id) return

        try {
            const newSubtask = await createSubtask(taskDetails.id, newSubtaskName)
            setSubtasks(prev => [...prev, newSubtask])
            setNewSubtaskName('')
        } catch (error) {
            console.error("Failed to create subtask", error)
            toast.error("Failed to add subtask")
        }
    }

    // Timer Logic
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current) }
    }, [isTimerRunning])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Safety check: if no task selected, don't render content but KEEP Sheet mounted to allow close animation if needed?
    // Actually if !isDrawerOpen, Sheet is closed.
    // We just need to handle the case where isDrawerOpen=true but taskDetails is null (loading or error).

    // IMPORTANT: We use `taskDetails` for rendering.
    // If we closed, we want to clear data? 

    const task = taskDetails

    return (
        <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 flex flex-col">
                {task ? (
                    <>
                        {/* Header */}
                        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={task.status === 'completed' || task.status === 'done' ? "secondary" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "gap-2",
                                        (task.status === 'completed' || task.status === 'done') && "bg-green-100 text-green-700 hover:bg-green-200"
                                    )}
                                    onClick={() => handleUpdate({ status: task.status === 'completed' || task.status === 'done' ? 'todo' : 'completed' })}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {task.status === 'completed' || task.status === 'done' ? "Completed" : "Mark Complete"}
                                </Button>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1">
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Main Content (Left Column) */}
                                <div className="flex-1 p-4 sm:p-6 space-y-6 sm:space-y-8 lg:border-r">
                                    {/* Title */}
                                    <div className="flex items-start gap-3">
                                        <CheckSquare className="h-6 w-6 text-muted-foreground mt-1" />
                                        <Input
                                            key={task.id}
                                            defaultValue={task.name}
                                            onBlur={(e) => {
                                                if (e.target.value.trim() && e.target.value !== task.name) {
                                                    handleUpdate({ name: e.target.value.trim() })
                                                }
                                            }}
                                            className="text-2xl font-bold border-0 p-0 focus-visible:ring-0 h-auto"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            Description
                                        </div>
                                        <Textarea
                                            key={`desc-${task.id}`}
                                            placeholder="Add more detail to this task..."
                                            className="min-h-[120px] resize-none"
                                            defaultValue={task.description}
                                            onBlur={(e) => {
                                                if (e.target.value !== task.description) {
                                                    handleUpdate({ description: e.target.value })
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Subtasks */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <CheckSquare className="h-4 w-4" />
                                            Subtasks
                                        </div>
                                        <div className="space-y-2">
                                            {subtasks.map((subtask) => (
                                                <div key={subtask.id} className="flex items-center gap-2 group p-2 rounded-lg hover:bg-accent/50">
                                                    <button
                                                        onClick={() => handleSubtaskToggle(subtask.id, subtask.status)}
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        {subtask.status === 'completed' || subtask.status === 'done' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Circle className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <span className={`flex-1 text-sm ${subtask.status === 'completed' || subtask.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                                        {subtask.name}
                                                    </span>
                                                    {subtask.assignee?.full_name && (
                                                        <span className="text-xs text-muted-foreground">{subtask.assignee.full_name}</span>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="flex items-center gap-2 p-2">
                                                <Plus className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Add a subtask..."
                                                    value={newSubtaskName}
                                                    onChange={(e) => setNewSubtaskName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddSubtask()
                                                        }
                                                    }}
                                                    onBlur={() => { if (newSubtaskName.trim()) handleAddSubtask() }}
                                                    className="h-8 text-sm border-0 focus-visible:ring-0 px-0 bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments (Placeholder) */}
                                    <div className="space-y-4 pt-4 border-t">
                                        {/* ... Comments UI kept simple or removed if not fully ready. Keeping placeholder. */}
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            Comments
                                        </div>
                                        <div className="text-sm text-muted-foreground italic">Comments coming soon...</div>
                                    </div>
                                </div>

                                {/* Sidebar (Right Column) */}
                                <div className="w-full lg:w-80 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-muted/10 border-t lg:border-t-0">
                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Assignee</label>
                                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                value={task.assignee_id || "unassigned"}
                                                onValueChange={(val) => {
                                                    const member = members.find(m => m.id === val)
                                                    handleUpdate({ assignee_id: val === "unassigned" ? null : val })
                                                    // Optimistic update of UI name not handled perfectly here but ok for now
                                                }}
                                            >
                                                <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                                    <SelectValue placeholder={task.assignee?.full_name || "Unassigned"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {members.map(member => (
                                                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Due Date</label>
                                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "h-auto p-0 text-sm font-normal w-full justify-start hover:bg-transparent",
                                                            !task.due_date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={task.due_date ? new Date(task.due_date) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                handleUpdate({ dueDate: date.toISOString() })
                                                            } else {
                                                                handleUpdate({ dueDate: null })
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                value={task.status || "todo"}
                                                onValueChange={(val) => handleUpdate({ status: val })}
                                            >
                                                <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todo">To Do</SelectItem>
                                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                                    <SelectItem value="done">Done</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Priority</label>
                                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                value={task.priority}
                                                onValueChange={(val) => handleUpdate({ priority: val })}
                                            >
                                                <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Time Tracking */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Time Tracking</label>
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                            <div className="font-mono text-lg font-medium">
                                                {formatTime(elapsedTime)}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={isTimerRunning ? "destructive" : "default"}
                                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                            >
                                                {isTimerRunning ? 'Stop' : 'Start'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading task details...</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
