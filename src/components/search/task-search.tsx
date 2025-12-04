'use client'

import * as React from 'react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useTaskStore } from '@/store/use-task-store'
import { Search, Calendar, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function TaskSearch() {
    const [open, setOpen] = React.useState(false)
    const { tasks, openDrawer } = useTaskStore()

    // Mock data for other entities
    const users = [
        { id: 'u1', name: 'John Doe', email: 'john@example.com', avatar: '/placeholder-user.jpg' },
        { id: 'u2', name: 'Alice Smith', email: 'alice@example.com', avatar: '/placeholder.jpg' },
        { id: 'u3', name: 'Bob Jones', email: 'bob@example.com', avatar: '/placeholder.jpg' },
    ]

    const clients = [
        { id: 'c1', name: 'Acme Corp', industry: 'Technology' },
        { id: 'c2', name: 'Global Industries', industry: 'Manufacturing' },
        { id: 'c3', name: 'TechStart Inc', industry: 'Startup' },
    ]

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const router = useRouter()
    const handleSelect = (type: 'task' | 'user' | 'client', id: string) => {
        setOpen(false)
        if (type === 'task') {
            const task = tasks.find((t) => t.id === id)
            if (task) openDrawer(task)
        } else if (type === 'user') {
            router.push(`/users/${id}`)
        } else if (type === 'client') {
            router.push(`/clients/${id}`)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search tasks, users, clients..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Tasks">
                        {tasks.map((task) => (
                            <CommandItem
                                key={task.id}
                                value={task.name}
                                onSelect={() => handleSelect('task', task.id)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`} />
                                    <span className="flex-1 truncate">{task.name}</span>
                                    {task.dueDate && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {task.dueDate}
                                        </div>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Users">
                        {users.map((user) => (
                            <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => handleSelect('user', user.id)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1 truncate">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Clients">
                        {clients.map((client) => (
                            <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => handleSelect('client', client.id)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1 truncate">{client.name}</span>
                                    <span className="text-xs text-muted-foreground">{client.industry}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
