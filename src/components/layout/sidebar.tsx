'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, CheckSquare, Inbox, Briefcase, Plus, Settings, TrendingUp } from 'lucide-react'
import { useProjectStore } from '@/store/use-project-store'
import { toast } from "sonner"
const sidebarLinks = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: CheckSquare, label: 'My Tasks', href: '/my-tasks' },
    { icon: Inbox, label: 'Inbox', href: '/inbox' },
    { icon: CheckSquare, label: 'Completed', href: '/completed' },
    { icon: Briefcase, label: 'Clients', href: '/clients' },
    { icon: TrendingUp, label: 'Insights', href: '/insights' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { projects, openCreateDialog, deleteProject, openEditDialog } = useProjectStore()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-background">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
                <Link href="/" className="flex items-center gap-2 font-semibold group">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary/60 shadow-sm group-hover:shadow-md transition-shadow" />
                    <span className="text-lg">TaskApp</span>
                </Link>
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
                                                        deleteProject(project.id)
                                                        toast.success("Project deleted")
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
