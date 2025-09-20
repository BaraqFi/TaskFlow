# TaskFlow - Smart Personal Task Manager

A lightweight task management app designed for students and young professionals who want to stay organized without being overwhelmed by bloated project management tools.

## ✨ Features

- **User Authentication** - Secure sign up/sign in with Supabase Auth
- **Project Management** - Create and organize tasks into projects
- **Task Management** - Create, update, and track tasks with priorities and due dates
- **Dashboard** - Overview of your productivity with stats and analytics
- **Dark/Light Mode** - Toggle between themes for better user experience
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Updates** - Live data synchronization with Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS with custom color scheme
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaskFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `env.template` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp env.template .env.local
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Run the SQL script to create all necessary tables and policies

5. **Set up file storage**
   - Go to your Supabase project dashboard
   - Navigate to Storage
   - Create a new bucket named `task-attachments`
   - Set the bucket to public (or configure RLS policies as needed)
   - This bucket will store file attachments for tasks

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

The app uses a custom color palette:
- **Primary**: #f2766b (Coral red)
- **Secondary**: #585166 (Dark gray)
- **Accent**: #08fb26 (Bright green)

## 📁 Project Structure

```
TaskFlow/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── tasks/            # Tasks page
│   ├── calendar/         # Calendar page
│   ├── analytics/        # Analytics page
│   └── projects/         # Project pages
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts
├── lib/                 # Utility functions
└── database-schema.sql  # Database setup script
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚧 Roadmap

- [ ] Task creation and editing forms
- [ ] Drag and drop task reordering
- [ ] Calendar view integration
- [ ] Advanced search and filtering
- [ ] File attachments for tasks
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] AI-powered task suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- Icons by Lucide React
- Styled with TailwindCSS
