import { create } from 'zustand'

interface Subtask {
    id: string
    name: string
    completed: boolean
    assignee?: {
        name: string
        avatarUrl?: string
    }
}

interface Task {
    id: string
    name: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    assignee?: {
        name: string
        avatarUrl?: string
    }
    project?: string
    tags?: string[]
    subtasks?: Subtask[]
    completed?: boolean
    status?: 'todo' | 'in-progress' | 'done'
}

interface TaskStore {
    // Task Drawer
    isDrawerOpen: boolean
    selectedTask: Task | null
    openDrawer: (task: Task) => void
    closeDrawer: () => void

    // Create Task Dialog
    isCreateDialogOpen: boolean
    openCreateDialog: () => void
    closeCreateDialog: () => void

    // Tasks list (mock data for now)
    tasks: Task[]
    addTask: (task: Task) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void

    // Subtasks
    addSubtask: (taskId: string, subtask: Subtask) => void
    updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void
    deleteSubtask: (taskId: string, subtaskId: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
    // Task Drawer
    isDrawerOpen: false,
    selectedTask: null,
    openDrawer: (task) => set({ isDrawerOpen: true, selectedTask: task }),
    closeDrawer: () => set({ isDrawerOpen: false, selectedTask: null }),

    // Create Task Dialog
    isCreateDialogOpen: false,
    openCreateDialog: () => set({ isCreateDialogOpen: true }),
    closeCreateDialog: () => set({ isCreateDialogOpen: false }),

    // Tasks
    tasks: [
        { id: '1', name: 'Research competitors', priority: 'high', dueDate: 'Tomorrow', commentCount: 2, assignee: { name: 'Alice' }, status: 'todo' },
        { id: '2', name: 'Draft project brief', priority: 'medium', dueDate: 'Fri', attachmentCount: 1, assignee: { name: 'Bob' }, status: 'todo' },
        { id: '3', name: 'Design homepage', priority: 'high', dueDate: 'Next Week', tags: ['Design'], assignee: { name: 'Charlie' }, status: 'in-progress' },
    ],
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    updateTask: (id, updates) =>
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            )
            return {
                tasks: updatedTasks,
                selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, ...updates } : state.selectedTask
            }
        }),
    deleteTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
        })),

    // Subtasks
    addSubtask: (taskId, subtask) =>
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === taskId
                    ? { ...task, subtasks: [...(task.subtasks || []), subtask] }
                    : task
            )
            const updatedTask = updatedTasks.find(t => t.id === taskId)
            return {
                tasks: updatedTasks,
                selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask
            }
        }),
    updateSubtask: (taskId, subtaskId, updates) =>
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks?.map((subtask) =>
                            subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                        ),
                    }
                    : task
            )
            const updatedTask = updatedTasks.find(t => t.id === taskId)
            return {
                tasks: updatedTasks,
                selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask
            }
        }),
    deleteSubtask: (taskId, subtaskId) =>
        set((state) => {
            const updatedTasks = state.tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId),
                    }
                    : task
            )
            const updatedTask = updatedTasks.find(t => t.id === taskId)
            return {
                tasks: updatedTasks,
                selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask
            }
        }),
}))
