'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

interface SortMenuProps {
    onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void
}

export function SortMenu({ onSortChange }: SortMenuProps) {
    const [sortBy, setSortBy] = useState('dueDate')
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

    const handleSortChange = (value: string) => {
        setSortBy(value)
        onSortChange?.(value, direction)
    }

    const toggleDirection = () => {
        const newDirection = direction === 'asc' ? 'desc' : 'asc'
        setDirection(newDirection)
        onSortChange?.(sortBy, newDirection)
    }

    const sortOptions = [
        { value: 'dueDate', label: 'Due Date' },
        { value: 'priority', label: 'Priority' },
        { value: 'name', label: 'Name' },
        { value: 'assignee', label: 'Assignee' },
        { value: 'created', label: 'Created Date' },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                    {sortOptions.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleDirection}>
                    {direction === 'asc' ? (
                        <>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Ascending
                        </>
                    ) : (
                        <>
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Descending
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
