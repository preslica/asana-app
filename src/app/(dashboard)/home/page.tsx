'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, CheckCircle2, Plus, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { useTaskStore } from '@/store/use-task-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useProjectStore } from '@/store/use-project-store'
import { useUserStore } from '@/store/use-user-store'
import { cn } from '@/lib/utils'
import { DashboardCharts } from '@/components/analytics/dashboard-charts'
import { CreateWorkspaceDialog } from '@/components/workspace/create-workspace-dialog'

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
}

export default function HomePage() {
    const { tasks, openCreateDialog, openDrawer } = useTaskStore()
    const { currentWorkspace } = useWorkspaceStore()
    const { projects } = useProjectStore()
    const { user } = useUserStore()

    // Calculate stats
    const completedTasks = tasks.filter(t => t.completed).length
    const dueSoonTasks = tasks.filter(t => t.dueDate).length // simplistic check
    const overdueTasks = 0 // Would calculate based on actual dates

    if (!currentWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome to TaskApp</h2>
                <p className="text-muted-foreground max-w-sm">
                    Create a workspace to get started with your projects and tasks.
                </p>
                <div className="pt-4">
                    <CreateWorkspaceDialog />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">
                        {(() => {
                            const hour = new Date().getHours()
                            if (hour < 18) return "Good Afternoon"
                            return "Good Evening"
                        })()}, {user?.full_name?.split(' ')[0] || "User"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Here's what's happening today in {currentWorkspace.name}.
                    </p>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            This week
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dueSoonTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Next 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overdueTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks past due
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DashboardCharts />

            {/* All Tasks */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Tasks</CardTitle>
                            <CardDescription>
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} across all projects
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 animate-pulse">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                Get started by creating your first task and begin organizing your work
                            </p>
                            <Button
                                onClick={openCreateDialog}
                                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Task
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 hover:shadow-sm cursor-pointer transition-all duration-200"
                                    onClick={() => openDrawer(task)}
                                >
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{task.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {task.project && (
                                                <span className="text-xs text-muted-foreground">{task.project}</span>
                                            )}
                                            {task.dueDate && (
                                                <>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{task.dueDate}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={cn('text-xs font-normal', priorityColors[task.priority])}
                                    >
                                        {task.priority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>
                        Projects you've worked on recently
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {projects.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No projects found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.slice(0, 5).map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 hover:shadow-sm cursor-pointer transition-all duration-200"
                                >
                                    <div className={`h-10 w-10 rounded-lg ${project.color} flex items-center justify-center text-white font-semibold`}>
                                        {project.name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {project.description || "No description"}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
