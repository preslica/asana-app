'use client'

import { useState, useEffect } from 'react'
import { useTaskStore } from '@/store/use-task-store'
import { TaskCard } from '@/components/feature/task-card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    useDroppable,
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
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    commentCount?: number
    attachmentCount?: number
    assignee?: { name: string; avatarUrl?: string }
    tags?: string[]
}

interface Section {
    id: string
    name: string
    tasks: Task[]
}

const initialSections: Section[] = [
    {
        id: 'todo',
        name: 'To Do',
        tasks: [
            { id: '1', name: 'Research competitors', priority: 'high', dueDate: 'Tomorrow', commentCount: 2, assignee: { name: 'Alice' } },
            { id: '2', name: 'Draft project brief', priority: 'medium', dueDate: 'Fri', attachmentCount: 1, assignee: { name: 'Bob' } },
        ]
    },
    {
        id: 'in-progress',
        name: 'In Progress',
        tasks: [
            { id: '3', name: 'Design homepage', priority: 'high', dueDate: 'Next Week', tags: ['Design'], assignee: { name: 'Charlie' } },
        ]
    },
    {
        id: 'done',
        name: 'Done',
        tasks: []
    }
]

function SortableTask({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    )
}

function BoardColumn({ section, children }: { section: Section; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: section.id,
    })

    return (
        <div ref={setNodeRef} className="flex h-full w-80 min-w-[320px] flex-col rounded-lg bg-muted/50">
            <div className="flex items-center justify-between p-3">
                <h3 className="font-semibold text-sm">{section.name}</h3>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                {children}
            </ScrollArea>
        </div>
    )
}

import { useHaptics } from '@/hooks/use-haptics'

export function BoardView() {
    const { tasks, updateTask } = useTaskStore()
    const [sections, setSections] = useState<Section[]>([])
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const { impact, ImpactStyle, selectionStart } = useHaptics()

    useEffect(() => {
        const newSections = [
            {
                id: 'todo',
                name: 'To Do',
                tasks: tasks.filter(t => t.status === 'todo' || (!t.status && !t.completed))
            },
            {
                id: 'in-progress',
                name: 'In Progress',
                tasks: tasks.filter(t => t.status === 'in-progress')
            },
            {
                id: 'done',
                name: 'Done',
                tasks: tasks.filter(t => t.status === 'done' || t.completed)
            }
        ]
        // Only update if deep different to avoid loops/jitters? 
        // For now just set it.
        setSections(newSections as Section[])
    }, [tasks])

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

    const findSectionContainer = (id: string) => {
        if (sections.find((s) => s.id === id)) {
            return id
        }
        return sections.find((s) => s.tasks.find((t) => t.id === id))?.id
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = active.data.current?.task as Task
        setActiveTask(task)
        selectionStart()
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        const overId = over?.id

        if (!overId || active.id === overId) return

        const activeContainer = findSectionContainer(active.id as string)
        const overContainer = findSectionContainer(overId as string)

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return
        }

        setSections((prev) => {
            const activeSection = prev.find((s) => s.id === activeContainer)
            const overSection = prev.find((s) => s.id === overContainer)

            if (!activeSection || !overSection) return prev

            const activeItems = activeSection.tasks
            const overItems = overSection.tasks
            const activeIndex = activeItems.findIndex((t) => t.id === active.id)
            const overIndex = overItems.findIndex((t) => t.id === overId)

            let newIndex
            if (overId === overContainer) {
                // We are over the container itself, so add to the end
                newIndex = overItems.length + 1
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height
                const modifier = isBelowOverItem ? 1 : 0
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
            }

            return prev.map((section) => {
                if (section.id === activeContainer) {
                    return {
                        ...section,
                        tasks: activeItems.filter((t) => t.id !== active.id),
                    }
                }
                if (section.id === overContainer) {
                    return {
                        ...section,
                        tasks: [
                            ...overItems.slice(0, newIndex),
                            activeItems[activeIndex],
                            ...overItems.slice(newIndex, overItems.length),
                        ],
                    }
                }
                return section
            })
        })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        const activeContainer = findSectionContainer(active.id as string)
        const overContainer = findSectionContainer(over?.id as string)

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            setActiveTask(null)
            return
        }

        const activeIndex = sections
            .find((s) => s.id === activeContainer)!
            .tasks.findIndex((t) => t.id === active.id)
        const overIndex = sections
            .find((s) => s.id === overContainer)!
            .tasks.findIndex((t) => t.id === over?.id)

        if (activeIndex !== overIndex || activeContainer !== overContainer) {
            impact(ImpactStyle.Light)

            // Update local state for immediate feedback
            setSections((prev) => {
                const newSections = [...prev]
                const sectionIndex = newSections.findIndex((s) => s.id === activeContainer)
                newSections[sectionIndex].tasks = arrayMove(
                    newSections[sectionIndex].tasks,
                    activeIndex,
                    overIndex
                )
                return newSections
            })

            // Update store
            if (activeContainer !== overContainer) {
                updateTask(active.id as string, { status: overContainer as 'todo' | 'in-progress' | 'done' })
            }
        }

        setActiveTask(null)
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {sections.map((section) => (
                    <BoardColumn key={section.id} section={section}>
                        <SortableContext
                            id={section.id}
                            items={section.tasks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-3 pb-3 min-h-[100px]">
                                {section.tasks.map((task) => (
                                    <SortableTask key={task.id} task={task} />
                                ))}
                                {section.tasks.length === 0 && (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs italic p-4">
                                        Drop tasks here
                                    </div>
                                )}
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Task
                                </Button>
                            </div>
                        </SortableContext>
                    </BoardColumn>
                ))}

                <div className="w-80 min-w-[320px]">
                    <Button variant="outline" className="w-full border-dashed">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                    </Button>
                </div>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
