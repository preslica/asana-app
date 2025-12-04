# TaskApp - Work Management Platform

A full-featured Asana-style work management platform built with Next.js 15, Supabase, and Tailwind CSS.

## 🚀 Features

- **Authentication**: Email/password login and signup with Supabase Auth
- **Workspaces**: Multi-tenant workspace support
- **Projects**: Create and manage projects with multiple views
- **Tasks**: Full task management with priorities, assignees, due dates
- **Views**: Board (Kanban), List (Table), and Calendar views
- **My Tasks**: Personal task organization (Today/Upcoming/Later)
- **Inbox**: Real-time notifications for mentions and assignments
- **Task Drawer**: Detailed task view with comments, subtasks, and attachments
- **Responsive**: Mobile-friendly design

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **State Management**: Zustand
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd asana-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up Supabase**

Run the SQL schema in your Supabase project:
```bash
# Copy the contents of schema.sql and run it in Supabase SQL Editor
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/app
  /(auth)           # Authentication routes
    /login
    /signup
  /(dashboard)      # Main app routes
    /home
    /my-tasks
    /inbox
    /project/[id]
    /create-workspace
/components
  /ui               # Shadcn UI components
  /feature          # Feature-specific components
  /layout           # Layout components
/lib
  /supabase         # Supabase client utilities
/store              # Zustand state stores
```

## 🗄 Database Schema

The application uses the following main tables:

- `users` - User profiles
- `workspaces` - Multi-tenant workspaces
- `workspace_members` - Workspace membership
- `teams` - Teams within workspaces
- `projects` - Projects
- `sections` - Board columns / List sections
- `tasks` - Tasks with all metadata
- `comments` - Task comments

All tables have Row-Level Security (RLS) policies enabled for secure multi-tenant access.

## 🎨 UI Components

Built with Shadcn/UI for consistency and accessibility:

- Button, Input, Textarea
- Card, Badge, Avatar
- Dialog, Sheet, Tabs
- Table, Select, Calendar
- Dropdown Menu, Popover
- Scroll Area, Separator

## 🔐 Authentication

The app uses Supabase Auth with:

- Email/password authentication
- User profile creation on signup
- Protected routes (to be implemented)
- Session management

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
