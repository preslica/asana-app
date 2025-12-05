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
    setProjects: (projects: Project[]) => void
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
    // Projects
    projects: [],
    setProjects: (projects) => set({ projects }),
    addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
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
