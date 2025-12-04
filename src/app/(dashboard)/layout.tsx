'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TaskDrawer } from '@/components/feature/task-drawer'
import { useSidebarStore } from '@/store/use-sidebar-store'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CreateProjectDialog } from '@/components/feature/create-project-dialog'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isOpen, close } = useSidebarStore()

    // Enable keyboard shortcuts
    useKeyboardShortcuts()

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <Sidebar />
            </div>

            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <TaskDrawer />
            <CreateProjectDialog />
        </div>
    )
}
