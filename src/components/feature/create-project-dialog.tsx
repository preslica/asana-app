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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useProjectStore } from '@/store/use-project-store'
import { useState, useEffect } from 'react'
import { toast } from "sonner"

export function CreateProjectDialog() {
    const { isCreateDialogOpen, closeCreateDialog, addProject, updateProject, selectedProject } = useProjectStore()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('bg-blue-500')

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        if (selectedProject) {
            updateProject(selectedProject.id, {
                name,
                description,
                color,
            })
            toast.success("Project updated successfully")
        } else {
            addProject({
                id: Math.random().toString(36).substr(2, 9),
                name,
                description,
                color,
            })
            toast.success("Project created successfully")
        }

        handleClose()
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        setColor('bg-blue-500')
        closeCreateDialog()
        // We need to clear selectedProject in store, but for now closing dialog is enough
        // Ideally store should have a clearSelectedProject or closeDialog should handle it
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
                        <Button type="submit">{selectedProject ? 'Save Changes' : 'Create Project'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
