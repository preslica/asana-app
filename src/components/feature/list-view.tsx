'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, MoreHorizontal, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/use-task-store'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
    id: string
    name: string
    priority: string
    status: string
    dueDate: string
    assignee: { name: string; avatarUrl: string }
    tags: string[]
}

const initialTasks: Task[] = [
    {
        id: '1',
        name: 'Research competitors',
        priority: 'high',
        status: 'todo',
        dueDate: 'Tomorrow',
        assignee: { name: 'Alice', avatarUrl: '/placeholder.jpg' },
        tags: ['Strategy'],
    },
    {
        id: '2',
        name: 'Draft project brief',
        priority: 'medium',
        status: 'todo',
        dueDate: 'Fri',
        assignee: { name: 'Bob', avatarUrl: '/placeholder.jpg' },
        tags: ['Planning'],
    },
    {
        id: '3',
        name: 'Design homepage',
        priority: 'high',
        status: 'in-progress',
        dueDate: 'Next Week',
        assignee: { name: 'Charlie', avatarUrl: '/placeholder.jpg' },
        tags: ['Design'],
    },
]

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
}

function SortableRow({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
    }

    const { openDrawer } = useTaskStore()

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className="group hover:bg-muted/50 cursor-pointer"
            onClick={() => openDrawer(task as any)}
        >
            <TableCell className="w-[40px] p-0 pl-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </TableCell>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer")} />
                    <span>{task.name}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatarUrl} />
                        <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant="secondary"
                    className={cn('text-xs font-normal', priorityColors[task.priority as keyof typeof priorityColors])}
                >
                    {task.priority}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex gap-1">
                    {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

import { useHaptics } from '@/hooks/use-haptics'

export function ListView() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const { impact, ImpactStyle } = useHaptics()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            impact(ImpactStyle.Medium)
            setTasks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    return (
        <div className="rounded-md border">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[400px]">Task Name</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableContext
                            items={tasks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {tasks.map((task) => (
                                <SortableRow key={task.id} task={task} />
                            ))}
                        </SortableContext>
                        <TableRow>
                            <TableCell colSpan={7} className="p-2">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                                    <MoreHorizontal className="mr-2 h-4 w-4 opacity-0" />
                                    <span className="ml-6">Add Task...</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DndContext>
        </div>
    )
}
