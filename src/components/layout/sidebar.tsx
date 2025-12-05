'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, CheckSquare, Inbox, Briefcase, Plus, Settings, TrendingUp, ChevronDown, Building2 } from 'lucide-react'
import { useProjectStore } from '@/store/use-project-store'
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react'
// ... existing imports
import { getWorkspaces, getProjects, deleteProject as apiDeleteProject } from '@/lib/api'
import { CreateWorkspaceDialog } from '@/components/workspace/create-workspace-dialog'

const sidebarLinks = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: CheckSquare, label: 'My Tasks', href: '/my-tasks' },
    { icon: Inbox, label: 'Inbox', href: '/inbox' },
    { icon: CheckSquare, label: 'Completed', href: '/completed' },
    { icon: Briefcase, label: 'Clients', href: '/clients' },
    { icon: TrendingUp, label: 'Insights', href: '/insights' },
]

import { useWorkspaceStore } from '@/store/use-workspace-store'

export function Sidebar() {
    const pathname = usePathname()
    // Use project store
    const { projects, openCreateDialog, deleteProject, openEditDialog, setProjects } = useProjectStore()

    // Use workspace store
    const { workspaces, currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspaceStore()

    useEffect(() => {
        loadWorkspaces()
    }, [])

    useEffect(() => {
        if (currentWorkspace) {
            loadProjects()
        } else {
            setProjects([])
        }
    }, [currentWorkspace])

    const loadWorkspaces = async () => {
        try {
            const data = await getWorkspaces()
            setWorkspaces(data || [])
        } catch (error) {
            console.error("Failed to load workspaces", error)
        }
    }

    const loadProjects = async () => {
        if (!currentWorkspace) return
        try {
            const data = await getProjects(currentWorkspace.id)
            setProjects(data || [])
        } catch (error) {
            console.error("Failed to load projects", error)
            toast.error("Failed to load projects")
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        // Optimistic update or wait? Let's wait.
        try {
            await apiDeleteProject(projectId)
            deleteProject(projectId) // Update store
            toast.success("Project deleted")
        } catch (error) {
            console.error("Failed to delete project", error)
            toast.error("Failed to delete project")
        }
    }

    return (
        <div className="flex h-full w-64 flex-col border-r bg-background">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-2 hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <span className="font-semibold truncate max-w-[120px]">
                                    {currentWorkspace?.name || "Select Workspace"}
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                        {workspaces.map((ws) => (
                            <DropdownMenuItem key={ws.id} onClick={() => setCurrentWorkspace(ws)}>
                                {ws.name} {currentWorkspace?.id === ws.id && "✓"}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <CreateWorkspaceDialog onWorkspaceCreated={loadWorkspaces} />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>


            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="space-y-4 py-4">
                        <div className="px-3 py-2">
                            <div className="space-y-1">
                                {sidebarLinks.map((link) => (
                                    <Button
                                        key={link.href}
                                        variant={pathname === link.href ? 'secondary' : 'ghost'}
                                        className={cn(
                                            "w-full justify-start transition-all",
                                            pathname === link.href && "bg-secondary shadow-sm"
                                        )}
                                        asChild
                                    >
                                        <Link href={link.href}>
                                            <link.icon className="mr-2 h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="px-3 py-2">
                            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                                Projects
                            </h2>
                            <div className="space-y-1">
                                {projects.map((project) => (
                                    <div key={project.id} className="group relative flex items-center">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start pr-12"
                                            asChild
                                        >
                                            <Link href={`/project/${project.id}`}>
                                                <div className={`mr-2 h-2 w-2 rounded-full ${project.color}`} />
                                                <span className="truncate">{project.name}</span>
                                            </Link>
                                        </Button>
                                        <div className="absolute right-2 hidden group-hover:flex items-center gap-1">
                                            {/* Edit Button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    openEditDialog(project)
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-3 w-3"
                                                >
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                </svg>
                                            </Button>
                                            {/* Delete Button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (confirm("Are you sure you want to delete this project?")) {
                                                        handleDeleteProject(project.id)
                                                    }
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-3 w-3"
                                                >
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                    onClick={openCreateDialog}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </div>
        </div>
    )
}
