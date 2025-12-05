import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Workspace {
    id: string
    name: string
    owner_id: string
    role?: string // Role of the current user in this workspace
}

interface WorkspaceStore {
    workspaces: Workspace[]
    currentWorkspace: Workspace | null
    setWorkspaces: (workspaces: Workspace[]) => void
    setCurrentWorkspace: (workspace: Workspace) => void
    addWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
    persist(
        (set) => ({
            workspaces: [],
            currentWorkspace: null,
            setWorkspaces: (workspaces) => {
                set({ workspaces })
                // If no current workspace is selected, select the first one
                set((state) => {
                    if (!state.currentWorkspace && workspaces.length > 0) {
                        return { currentWorkspace: workspaces[0] }
                    }
                    return {}
                })
            },
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
            addWorkspace: (workspace) => set((state) => ({
                workspaces: [...state.workspaces, workspace],
                currentWorkspace: workspace // Switch to new workspace
            })),
        }),
        {
            name: 'workspace-storage',
        }
    )
)
