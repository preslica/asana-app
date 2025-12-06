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
    MoreHorizontal,
    X,
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Clock,
} from 'lucide-react'
import { useTaskStore } from '@/store/use-task-store'
import { useUserStore } from '@/store/use-user-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { getWorkspaceMembers } from '@/lib/api'

export function TaskDrawer() {
    const {
        isDrawerOpen,
        closeDrawer,
        selectedTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        updateTask
    } = useTaskStore()

    const [newSubtaskName, setNewSubtaskName] = useState('')
    const [selectedAssignee, setSelectedAssignee] = useState(selectedTask?.assignee?.name || '')
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number; type: string }>>([])
    const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; timestamp: Date }>>([])
    const [newComment, setNewComment] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [mounted, setMounted] = useState(false)
    const { user } = useUserStore()
    const { currentWorkspace } = useWorkspaceStore()
    const [members, setMembers] = useState<any[]>([])

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



    // Sync state when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setSelectedAssignee(selectedTask.assignee?.name || 'unassigned')
            // Parse and set due date if it exists
            if (selectedTask.dueDate) {
                try {
                    const parsedDate = new Date(selectedTask.dueDate)
                    if (!isNaN(parsedDate.getTime())) {
                        setDueDate(parsedDate)
                    }
                } catch (e) {
                    setDueDate(undefined)
                }
            } else {
                setDueDate(undefined)
            }
        }
    }, [selectedTask])

    // Timer functionality
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        }
    }, [isTimerRunning])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            setAttachments(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type
            }])
        })
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setComments(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            author: user?.full_name || 'User',
            text: newComment,
            timestamp: new Date()
        }])
        setNewComment('')
    }

    const handleAddSubtask = () => {
        if (!newSubtaskName.trim() || !selectedTask) return

        addSubtask(selectedTask.id, {
            id: Math.random().toString(36).substr(2, 9),
            name: newSubtaskName,
            completed: false,
            assignee: { name: 'Unassigned' } // Default unassigned
        })
        setNewSubtaskName('')
    }

    if (!selectedTask) return null

    if (!mounted) return null

    return (
        <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={selectedTask.completed ? "secondary" : "outline"}
                            size="sm"
                            className={cn(
                                "gap-2",
                                selectedTask.completed && "bg-green-100 text-green-700 hover:bg-green-200"
                            )}
                            onClick={() => updateTask(selectedTask.id, { completed: !selectedTask.completed })}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {selectedTask.completed ? "Completed" : "Mark Complete"}
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
                                    key={selectedTask.id}
                                    defaultValue={selectedTask.name}
                                    onBlur={(e) => {
                                        if (e.target.value.trim() && e.target.value !== selectedTask.name) {
                                            updateTask(selectedTask.id, { name: e.target.value.trim() })
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
                                    key={`desc-${selectedTask.id}`}
                                    placeholder="Add more detail to this task..."
                                    className="min-h-[120px] resize-none"
                                    defaultValue={selectedTask.description}
                                    onBlur={(e) => {
                                        if (e.target.value !== selectedTask.description) {
                                            updateTask(selectedTask.id, { description: e.target.value })
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
                                    {selectedTask.subtasks?.map((subtask) => (
                                        <div key={subtask.id} className="flex items-center gap-2 group p-2 rounded-lg hover:bg-accent/50">
                                            <button
                                                onClick={() => updateSubtask(selectedTask.id, subtask.id, { completed: !subtask.completed })}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                {subtask.completed ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Circle className="h-4 w-4" />
                                                )}
                                            </button>
                                            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {subtask.name}
                                            </span>

                                            <Select
                                                defaultValue={subtask.assignee?.name || "unassigned"}
                                                onValueChange={(val) => updateSubtask(selectedTask.id, subtask.id, { assignee: { name: val } })}
                                            >
                                                <SelectTrigger className="w-[120px] h-7 text-xs border-0 bg-transparent hover:bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        <span className="truncate">{subtask.assignee?.name || "Assign"}</span>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {members.map(member => (
                                                        <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                                                onClick={() => deleteSubtask(selectedTask.id, subtask.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
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
                                            onBlur={handleAddSubtask}
                                            className="h-8 text-sm border-0 focus-visible:ring-0 px-0 bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                    Comments
                                </div>
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="/placeholder.jpg" />
                                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium">{comment.author}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {comment.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/placeholder.jpg" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 gap-2">
                                            <Textarea
                                                placeholder="Ask a question or post an update..."
                                                className="min-h-[80px] mb-2"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <Button
                                                size="sm"
                                                disabled={!newComment.trim()}
                                                onClick={handleAddComment}
                                            >
                                                Comment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
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
                                        value={selectedAssignee}
                                        onValueChange={(val) => {
                                            setSelectedAssignee(val)
                                            updateTask(selectedTask.id, { assignee: { name: val } })
                                        }}
                                    >
                                        <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                            <SelectValue placeholder="No assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {members.map(member => (
                                                <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
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
                                                    !dueDate && "text-muted-foreground"
                                                )}
                                            >
                                                {dueDate ? format(dueDate, 'PPP') : 'No due date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={(date) => {
                                                    setDueDate(date)
                                                    if (date) {
                                                        updateTask(selectedTask.id, { dueDate: format(date, 'PPP') })
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Project */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Project</label>
                                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                    <Select
                                        value={selectedTask.project || "Marketing"}
                                        onValueChange={(val) => updateTask(selectedTask.id, { project: val })}
                                    >
                                        <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                            <SelectItem value="Design">Design</SelectItem>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="Inbox">Inbox</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    <Select
                                        value={selectedTask.status || "todo"}
                                        onValueChange={(val: any) => updateTask(selectedTask.id, { status: val })}
                                    >
                                        <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
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
                                        value={selectedTask.priority}
                                        onValueChange={(val: any) => updateTask(selectedTask.id, { priority: val })}
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

                            {/* Attachments */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Attachments</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {attachments.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic">No attachments</div>
                                ) : (
                                    <div className="space-y-2">
                                        {attachments.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-2 rounded-lg border bg-background">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                    <div className="truncate">
                                                        <p className="text-xs font-medium truncate">{file.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive flex-shrink-0"
                                                    onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
            </SheetContent>
        </Sheet>
    )
}
