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
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface FilterDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FilterDialog({ open, onOpenChange }: FilterDialogProps) {
    const [filters, setFilters] = useState({
        priority: '',
        assignee: '',
        dueDate: '',
        tags: [] as string[],
        status: '',
    })

    const handleClearFilters = () => {
        setFilters({
            priority: '',
            assignee: '',
            dueDate: '',
            tags: [],
            status: '',
        })
    }

    const handleApplyFilters = () => {
        // TODO: Apply filters to task list
        console.log('Applying filters:', filters)
        onOpenChange(false)
    }

    const activeFilterCount = Object.values(filters).filter(v =>
        Array.isArray(v) ? v.length > 0 : v !== ''
    ).length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Filter Tasks</DialogTitle>
                    <DialogDescription>
                        Filter tasks by priority, assignee, due date, and more.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
                            <SelectTrigger id="assignee">
                                <SelectValue placeholder="All assignees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All assignees</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                <SelectItem value="john">John Doe</SelectItem>
                                <SelectItem value="alice">Alice Smith</SelectItem>
                                <SelectItem value="bob">Bob Jones</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Select value={filters.dueDate} onValueChange={(value) => setFilters(prev => ({ ...prev, dueDate: value }))}>
                            <SelectTrigger id="dueDate">
                                <SelectValue placeholder="Any time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any time</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="today">Due today</SelectItem>
                                <SelectItem value="week">Due this week</SelectItem>
                                <SelectItem value="month">Due this month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                                <SelectItem value="complete">Complete</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">
                                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleApplyFilters}>
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
