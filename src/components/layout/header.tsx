'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, Search, Plus, LogOut } from 'lucide-react'
import { useSidebarStore } from '@/store/use-sidebar-store'
import { useTaskStore } from '@/store/use-task-store'
import { useUserStore } from '@/store/use-user-store'
import { CreateTaskDialog } from '@/components/feature/create-task-dialog'
import { TaskSearch } from '@/components/search/task-search'
import { logout } from '@/app/actions/auth'

export function Header() {
    const { toggle } = useSidebarStore()
    const { openCreateDialog } = useTaskStore()
    const { user } = useUserStore()

    return (
        <>
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={toggle}
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>

                <div className="w-full flex-1">
                    <TaskSearch />
                </div>

                <Button
                    size="sm"
                    className="hidden md:flex bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                    onClick={openCreateDialog}
                    data-new-task-button
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar_url || "/placeholder-user.jpg"} alt={user?.full_name || "@user"} />
                                <AvatarFallback>{user?.full_name ? user.full_name[0] : "U"}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/support">Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={async () => {
                                await logout()
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <CreateTaskDialog />
        </>
    )
}
