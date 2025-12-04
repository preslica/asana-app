"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart, PieChart, Pie, Cell } from "recharts"

const completedTasksData = {
    daily: [
        { name: "Mon", user: 4, company: 12 },
        { name: "Tue", user: 6, company: 18 },
        { name: "Wed", user: 5, company: 15 },
        { name: "Thu", user: 8, company: 22 },
        { name: "Fri", user: 7, company: 20 },
        { name: "Sat", user: 2, company: 8 },
        { name: "Sun", user: 1, company: 5 },
    ],
    weekly: [
        { name: "Week 1", user: 15, company: 45 },
        { name: "Week 2", user: 18, company: 52 },
        { name: "Week 3", user: 12, company: 48 },
        { name: "Week 4", user: 20, company: 60 },
    ],
    monthly: [
        { name: "Jan", user: 45, company: 150 },
        { name: "Feb", user: 52, company: 180 },
        { name: "Mar", user: 48, company: 200 },
        { name: "Apr", user: 60, company: 210 },
        { name: "May", user: 55, company: 190 },
        { name: "Jun", user: 65, company: 220 },
    ]
}

const overdueData = [
    { name: "Marketing", value: 4 },
    { name: "Engineering", value: 8 },
    { name: "Design", value: 3 },
    { name: "Sales", value: 5 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function InsightsView() {
    return (
        <div className="space-y-6">
            {/* Completed Tasks - User vs Company */}
            <Card>
                <CardHeader>
                    <CardTitle>Productivity Trends</CardTitle>
                    <CardDescription>Compare your performance with the company average</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="daily" className="space-y-4">
                        <div className="flex justify-end">
                            <TabsList>
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            </TabsList>
                        </div>

                        {Object.entries(completedTasksData).map(([period, data]) => (
                            <TabsContent key={period} value={period} className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data}>
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
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Overdue Tasks by Project */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overdue Tasks Distribution</CardTitle>
                        <CardDescription>Breakdown of overdue tasks by project</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={overdueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {overdueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Task Completion Rate */}
                <Card>
                    <CardHeader>
                        <CardTitle>Completion Rate</CardTitle>
                        <CardDescription>Your task completion efficiency over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={completedTasksData.monthly}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="user" stroke="#adfa1d" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
