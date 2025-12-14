'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Kanban, List, Calendar, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomizeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CustomizeDialog({ open, onOpenChange }: CustomizeDialogProps) {
    const [projectName, setProjectName] = useState('Marketing Campaign')
    const [description, setDescription] = useState('Q4 Brand Awareness Push')
    const [defaultView, setDefaultView] = useState('board')
    const [selectedIcon, setSelectedIcon] = useState('kanban')
    const [selectedColor, setSelectedColor] = useState('blue')

    const icons = [
        { value: 'kanban', icon: Kanban, label: 'Kanban' },
        { value: 'list', icon: List, label: 'List' },
        { value: 'calendar', icon: Calendar, label: 'Calendar' },
        { value: 'palette', icon: Palette, label: 'Palette' },
    ]

    const colors = [
        { value: 'blue', color: 'bg-blue-500' },
        { value: 'purple', color: 'bg-purple-500' },
        { value: 'green', color: 'bg-green-500' },
        { value: 'orange', color: 'bg-orange-500' },
        { value: 'pink', color: 'bg-pink-500' },
        { value: 'red', color: 'bg-red-500' },
    ]

    const handleSave = () => {
        // TODO: Save project customization
        console.log('Saving customization:', {
            projectName,
            description,
            defaultView,
            selectedIcon,
            selectedColor,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Customize Project</DialogTitle>
                    <DialogDescription>
                        Personalize your project&apos;s appearance and settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Project Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                            id="project-name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Project Icon */}
                    <div className="grid gap-2">
                        <Label>Project Icon</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {icons.map((icon) => {
                                const Icon = icon.icon
                                return (
                                    <button
                                        key={icon.value}
                                        type="button"
                                        onClick={() => setSelectedIcon(icon.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:bg-accent",
                                            selectedIcon === icon.value && "border-primary ring-2 ring-primary/20 bg-accent"
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-xs">{icon.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Project Color */}
                    <div className="grid gap-2">
                        <Label>Project Color</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={cn(
                                        "h-12 w-12 rounded-lg transition-all hover:scale-110",
                                        color.color,
                                        selectedColor === color.value && "ring-2 ring-offset-2 ring-primary"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Default View */}
                    <div className="grid gap-2">
                        <Label htmlFor="default-view">Default View</Label>
                        <Select value={defaultView} onValueChange={setDefaultView}>
                            <SelectTrigger id="default-view">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="board">Board View</SelectItem>
                                <SelectItem value="calendar">Calendar View</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
