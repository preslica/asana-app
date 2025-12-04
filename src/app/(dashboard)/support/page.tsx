'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageSquare, Mail, Book, HelpCircle, Send } from 'lucide-react'

export default function SupportPage() {
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">Support</h1>
                <p className="text-sm text-muted-foreground">
                    Get help and find answers to your questions
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                        <Book className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Documentation</CardTitle>
                        <CardDescription>
                            Browse our comprehensive guides and tutorials
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                        <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Community</CardTitle>
                        <CardDescription>
                            Join our community forum to connect with other users
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                        <Mail className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Email Support</CardTitle>
                        <CardDescription>
                            Get in touch with our support team directly
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Quick answers to common questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I create a new task?</AccordionTrigger>
                                <AccordionContent>
                                    Click the "New Task" button in the header or use the "Add Task" button in any section.
                                    Fill in the task details including name, priority, due date, and description, then click "Create Task".
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger>How do I invite team members?</AccordionTrigger>
                                <AccordionContent>
                                    Go to your workspace settings, click on "Members", and use the "Invite" button.
                                    You can send invitations via email or generate an invite link to share.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can I change my workspace name?</AccordionTrigger>
                                <AccordionContent>
                                    Yes! Go to Settings → Workspace Settings and click on the workspace name to edit it.
                                    Only workspace owners and admins can change the workspace name.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger>How do I switch between different views?</AccordionTrigger>
                                <AccordionContent>
                                    In any project, you'll see view tabs at the top (List, Board, Calendar).
                                    Simply click on the view you want to switch to. Your preference is saved per project.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                                <AccordionContent>
                                    Go to Settings → Account → Danger Zone. Please note that deleting your account is permanent
                                    and will remove all your data. Make sure to export any important information first.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Contact Support
                        </CardTitle>
                        <CardDescription>
                            Send us a message and we'll get back to you soon
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <Send className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                                <p className="text-sm text-muted-foreground">
                                    We'll get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="What do you need help with?"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Describe your issue or question..."
                                        rows={6}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                    <CardDescription>
                        More ways to learn and get help
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Book className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Video Tutorials</h4>
                                <p className="text-sm text-muted-foreground">
                                    Watch step-by-step guides on how to use TaskApp effectively
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Live Chat</h4>
                                <p className="text-sm text-muted-foreground">
                                    Chat with our support team in real-time during business hours
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Knowledge Base</h4>
                                <p className="text-sm text-muted-foreground">
                                    Search our extensive library of articles and how-to guides
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Newsletter</h4>
                                <p className="text-sm text-muted-foreground">
                                    Subscribe to get tips, updates, and best practices
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
