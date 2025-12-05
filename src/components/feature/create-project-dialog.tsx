'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProjectStore } from '@/store/use-project-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { createProject, updateProject as apiUpdateProject } from '@/lib/api'

export function CreateProjectDialog() {
    const { isCreateDialogOpen, closeCreateDialog, addProject: addProjectToStore, updateProject: updateProjectInStore, selectedProject } = useProjectStore()
    const { currentWorkspace } = useWorkspaceStore()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('bg-blue-500')
    const [loading, setLoading] = useState(false)

    // Effect to pre-fill form when editing
    useEffect(() => {
        if (selectedProject) {
            setName(selectedProject.name)
            setDescription(selectedProject.description || '')
            setColor(selectedProject.color)
        } else {
            setName('')
            setDescription('')
            setColor('bg-blue-500')
        }
    }, [selectedProject, isCreateDialogOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        if (!currentWorkspace) {
            toast.error("No workspace selected")
            return
        }

        setLoading(true)
        try {
            if (selectedProject) {
                const updates = { name, description, color }
                await apiUpdateProject(selectedProject.id, updates)
                updateProjectInStore(selectedProject.id, updates)
                toast.success("Project updated successfully")
            } else {
                const newProject = await createProject(currentWorkspace.id, {
                    name,
                    description,
                    color,
                })
                addProjectToStore(newProject)
                toast.success("Project created successfully")
            }
            handleClose()
        } catch (error: any) {
            console.error("Failed to save project", error)
            toast.error(error.message || "Failed to save project")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        setColor('bg-blue-500')
        closeCreateDialog()
    }

    const colors = [
        { name: 'Blue', value: 'bg-blue-500' },
        { name: 'Purple', value: 'bg-purple-500' },
        { name: 'Green', value: 'bg-green-500' },
        { name: 'Orange', value: 'bg-orange-500' },
        { name: 'Pink', value: 'bg-pink-500' },
        { name: 'Red', value: 'bg-red-500' },
        { name: 'Yellow', value: 'bg-yellow-500' },
        { name: 'Gray', value: 'bg-gray-500' },
    ]

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
                    <DialogDescription>
                        {selectedProject ? 'Update project details.' : 'Create a new project to organize your tasks and collaborate with your team.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Website Redesign"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this project about?"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className={`h-6 w-6 rounded-full ${c.value} ${color === c.value ? 'ring-2 ring-offset-2 ring-black' : ''
                                            }`}
                                        onClick={() => setColor(c.value)}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (selectedProject ? 'Save Changes' : 'Create Project')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

