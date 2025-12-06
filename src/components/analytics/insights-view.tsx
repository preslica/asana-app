"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart, PieChart, Pie, Cell } from "recharts"

import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/store/use-workspace-store"
import { useUserStore } from "@/store/use-user-store"
import { getWorkspaceTasks } from "@/lib/api"
import { format, subDays, startOfDay, isSameDay } from "date-fns"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function InsightsView() {
    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useUserStore()
    const [data, setData] = useState<{ daily: any[], monthly: any[] }>({ daily: [], monthly: [] })
    const [overdue, setOverdue] = useState<any[]>([])

    useEffect(() => {
        if (!currentWorkspace || !user) return

        getWorkspaceTasks(currentWorkspace.id).then(tasks => {
            if (!tasks) return

            // 1. Daily Trend (Last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 6 - i)
                return { date: d, name: format(d, 'EEE'), user: 0, company: 0 }
            })

            tasks.forEach((t: any) => {
                if (t.status === 'completed' && t.completed_at) {
                    const completedDate = new Date(t.completed_at)
                    last7Days.forEach(day => {
                        if (isSameDay(completedDate, day.date)) {
                            day.company++
                            if (t.assignee?.id === user.id) day.user++
                        }
                    })
                }
            })

            // 2. Overdue by Priority (proxy for Project as we don't fetch all projects just for names efficiently yet)
            // Or better: By Project Name if we fetched it?
            // Let's use priority for now as it's safer given the data we have, or mock project names if missing.
            // Actually getWorkspaceTasks does NOT fetch project name. Let's rely on priority or add project join.
            // Let's stick to status for now or simple "Overdue vs On Time".
            // Let's do Overdue by Priority.
            const overdueCounts: Record<string, number> = { high: 0, medium: 0, low: 0 }
            const now = new Date()

            tasks.forEach((t: any) => {
                if (t.status !== 'completed' && t.due_date && new Date(t.due_date) < now) {
                    const p = t.priority || 'medium'
                    if (overdueCounts[p] !== undefined) overdueCounts[p]++
                }
            })

            setOverdue([
                { name: 'High', value: overdueCounts.high },
                { name: 'Medium', value: overdueCounts.medium },
                { name: 'Low', value: overdueCounts.low }
            ].filter(d => d.value > 0))

            setData({ daily: last7Days, monthly: [] }) // Monthly omitted for brevity/MVP
        })
    }, [currentWorkspace, user])

    return (
        <div className="space-y-6">
            {/* Completed Tasks - User vs Company */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Productivity</CardTitle>
                    <CardDescription>Tasks completed over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.daily.length > 0 ? (
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.daily}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="user" name="You" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="company" name="Company Avg" fill="#888888" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading...</div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Overdue Tasks by Priority */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overdue by Priority</CardTitle>
                        <CardDescription>Breakdown of overdue tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {overdue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overdue}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {overdue.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No overdue tasks</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
