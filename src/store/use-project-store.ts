import { create } from 'zustand'

interface Project {
    id: string
    name: string
    description?: string
    color: string
    icon?: string
}

interface ProjectStore {
    // Create Project Dialog
    isCreateDialogOpen: boolean
    openCreateDialog: () => void
    closeCreateDialog: () => void

    // Projects list
    projects: Project[]
    addProject: (project: Project) => void
    updateProject: (id: string, updates: Partial<Project>) => void
    deleteProject: (id: string) => void

    // Edit Project
    selectedProject: Project | null
    openEditDialog: (project: Project) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
    // Create Project Dialog
    isCreateDialogOpen: false,
    openCreateDialog: () => set({ isCreateDialogOpen: true }),
    closeCreateDialog: () => set({ isCreateDialogOpen: false }),

    // Projects (Mock data initially)
    projects: [
        { id: '1', name: 'Marketing Campaign', color: 'bg-blue-500' },
        { id: '2', name: 'Product Launch', color: 'bg-purple-500' },
    ],
    addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
    updateProject: (id, updates) =>
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === id ? { ...project, ...updates } : project
            ),
        })),
    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
        })),

    // Edit Project
    selectedProject: null,
    openEditDialog: (project) => set({ isCreateDialogOpen: true, selectedProject: project }),
}))
