'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BoardView } from '@/components/feature/board-view'
import { ListView } from '@/components/feature/list-view'
import { List, Kanban, Calendar, Settings } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterDialog } from '@/components/project/filter-dialog'
import { SortMenu } from '@/components/project/sort-menu'
import { ShareDialog } from '@/components/project/share-dialog'
import { CustomizeDialog } from '@/components/project/customize-dialog'

export default function ProjectPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex flex-col gap-4 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Kanban className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Marketing Campaign</h1>
                            <p className="text-sm text-muted-foreground">Q4 Brand Awareness Push</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 mr-2">
                            <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarImage src="/placeholder.jpg" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarImage src="/placeholder.jpg" />
                                <AvatarFallback>AB</AvatarFallback>
                            </Avatar>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                +3
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsShareOpen(true)}>
                            Share
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-destructive" onClick={() => {
                                    if (confirm('Are you sure you want to delete this project?')) {
                                        alert('Project deleted (mock)')
                                    }
                                }}>
                                    Delete Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" onClick={() => setIsCustomizeOpen(true)}>
                            Customize
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="board" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <TabsList>
                        <TabsTrigger value="list" className="gap-2">
                            <List className="h-4 w-4" />
                            List
                        </TabsTrigger>
                        <TabsTrigger value="board" className="gap-2">
                            <Kanban className="h-4 w-4" />
                            Board
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            Filter
                        </Button>
                        <SortMenu onSortChange={(sortBy, direction) => {
                            console.log('Sort changed:', sortBy, direction)
                        }} />
                    </div>
                </div>

                <TabsContent value="list" className="flex-1">
                    <ListView />
                </TabsContent>

                <TabsContent value="board" className="flex-1 h-full">
                    <BoardView />
                </TabsContent>

                <TabsContent value="calendar" className="flex-1">
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Calendar View Implementation
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <FilterDialog open={isFilterOpen} onOpenChange={setIsFilterOpen} />
            <ShareDialog open={isShareOpen} onOpenChange={setIsShareOpen} />
            <CustomizeDialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen} />
        </div>
    )
}
