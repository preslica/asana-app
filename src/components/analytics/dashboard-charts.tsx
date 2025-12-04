"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const dailyData = [
    { name: "Mon", total: 12 },
    { name: "Tue", total: 18 },
    { name: "Wed", total: 15 },
    { name: "Thu", total: 22 },
    { name: "Fri", total: 20 },
    { name: "Sat", total: 8 },
    { name: "Sun", total: 5 },
]

const weeklyData = [
    { name: "Week 1", total: 45 },
    { name: "Week 2", total: 52 },
    { name: "Week 3", total: 48 },
    { name: "Week 4", total: 60 },
]

const monthlyData = [
    { name: "Jan", total: 150 },
    { name: "Feb", total: 180 },
    { name: "Mar", total: 200 },
    { name: "Apr", total: 210 },
    { name: "May", total: 190 },
    { name: "Jun", total: 220 },
]

export function DashboardCharts() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Completed Tasks Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <Tabs defaultValue="daily" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                    <TabsContent value="daily" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="weekly" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="monthly" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
