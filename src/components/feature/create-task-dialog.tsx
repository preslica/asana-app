'use client'

import { useState } from 'react'
import { toast } from "sonner"
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
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/use-task-store'

export function CreateTaskDialog() {
    const { isCreateDialogOpen, closeCreateDialog, addTask } = useTaskStore()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [dueDate, setDueDate] = useState<Date>()
    const [project, setProject] = useState('')
    const [assignee, setAssignee] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) return

        const newTask = {
            id: Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            description: description.trim() || undefined,
            priority,
            dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
            assignee: assignee && assignee !== 'unassigned' ? { name: assignee } : undefined,
            project: project || 'Inbox',
            tags: [],
            status: 'todo' as const,
        }

        addTask(newTask)
        toast.success("Task created successfully")

        // Reset form
        setName('')
        setDescription('')
        setPriority('medium')
        setDueDate(undefined)
        setProject('')
        setAssignee('')

        closeCreateDialog()
    }

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to your workflow. Fill in the details below to get started.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        {/* Task Name - Full Width */}
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-semibold flex items-center gap-1">
                                Task Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="name"
                                placeholder="e.g., Design landing page mockup"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="text-base"
                                autoFocus
                            />
                        </div>

                        {/* Description - Full Width */}
                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-semibold">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                placeholder="Add more details about this task..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        {/* Priority & Due Date - 2 Column on Desktop, Stack on Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="priority" className="text-sm font-semibold">
                                    Priority
                                </label>
                                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                                    <SelectTrigger id="priority" className="text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                Low Priority
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                                Medium Priority
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="high">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                High Priority
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-semibold">Due Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'justify-start text-left font-normal text-base',
                                                !dueDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dueDate}
                                            onSelect={setDueDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Assignee & Project - 2 Column on Desktop, Stack on Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="assignee" className="text-sm font-semibold">
                                    Assignee
                                </label>
                                <Select value={assignee} onValueChange={setAssignee}>
                                    <SelectTrigger id="assignee" className="text-base">
                                        <SelectValue placeholder="Assign to someone..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">?</div>
                                                Unassigned
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="John Doe">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">JD</div>
                                                John Doe
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Alice Smith">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">AS</div>
                                                Alice Smith
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Bob Jones">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">BJ</div>
                                                Bob Jones
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="project" className="text-sm font-semibold">
                                    Project
                                </label>
                                <Select value={project} onValueChange={setProject}>
                                    <SelectTrigger id="project" className="text-base">
                                        <SelectValue placeholder="Select a project..." />
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
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={closeCreateDialog} className="flex-1 sm:flex-none">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                        >
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
