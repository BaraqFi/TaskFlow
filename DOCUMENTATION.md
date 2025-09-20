# TaskFlow Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Component Documentation](#component-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [File Management](#file-management)
- [Development Guide](#development-guide)
- [Deployment](#deployment)

## 🎯 Overview

TaskFlow is a modern, lightweight task management application built for students and young professionals. It provides an intuitive interface for organizing tasks, managing projects, and tracking productivity.

### Key Features

- **Task Management**: Create, edit, delete, and organize tasks with drag & drop
- **Project Organization**: Group tasks by projects with custom colors
- **File Attachments**: Upload and manage files up to 10MB per task
- **Advanced Filtering**: Filter by status, priority, date range, and tags
- **Calendar View**: Visual task scheduling and due date management
- **Analytics Dashboard**: Track productivity and completion rates
- **Real-time Updates**: Instant UI updates with optimistic rendering
- **Responsive Design**: Works seamlessly on desktop and mobile

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Drag & Drop**: react-beautiful-dnd
- **Date Handling**: date-fns

## 🏗️ Architecture

### Project Structure

```
TaskFlow/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── projects/          # Project pages
│   ├── tasks/             # Task pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── tasks/            # Task-related components
│   ├── projects/         # Project-related components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── api-auth.ts       # Server-side auth helpers
│   ├── api-client.ts     # Client-side auth helpers
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── database-schema.sql   # Database schema
└── CHANGELOG.md          # Version history
```

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   └── Sidebar
├── Dashboard
├── TaskList
│   ├── TaskCard
│   ├── TaskForm
│   └── TaskDetailModal
├── ProjectList
│   ├── ProjectCard
│   └── ProjectForm
├── Calendar
└── Analytics
```

## 🔌 API Documentation

### Authentication

All API endpoints require authentication via JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Tasks API

#### GET /api/tasks

Retrieves tasks with optional filtering.

**Query Parameters:**
- `project_id` (string): Filter by project ID
- `status` (string): Filter by status (todo, in-progress, completed)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `search` (string): Search in title and description
- `date_filter` (string): Filter by date range
- `tag_filter` (string): Filter by tag

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "due_date": "2024-01-20T00:00:00Z",
    "estimated_time": 60,
    "tags": ["tag1", "tag2"],
    "position": 0,
    "projects": {
      "id": "uuid",
      "name": "Project Name",
      "color": "#f2766b"
    }
  }
]
```

#### POST /api/tasks

Creates a new task.

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-01-20T00:00:00Z",
  "estimated_time": 60,
  "project_id": "uuid",
  "tags": ["tag1", "tag2"],
  "position": 0
}
```

#### PUT /api/tasks/[id]

Updates an existing task.

#### DELETE /api/tasks/[id]

Deletes a task.

#### PUT /api/tasks/reorder

Reorders tasks by updating their positions.

**Request Body:**
```json
{
  "taskIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Projects API

#### GET /api/projects

Retrieves projects with optional archived filter.

**Query Parameters:**
- `include_archived` (boolean): Include archived projects

#### POST /api/projects

Creates a new project.

#### PUT /api/projects/[id]

Updates a project.

#### DELETE /api/projects/[id]

Deletes a project.

### File Attachments API

#### POST /api/tasks/[id]/attachments

Uploads a file attachment to a task.

**Request:** Multipart form data with file

#### GET /api/tasks/[id]/attachments

Retrieves attachments for a task.

#### DELETE /api/tasks/[id]/attachments/[attachmentId]

Deletes a file attachment.

#### GET /api/files/[filename]

Downloads a file attachment.

## 🧩 Component Documentation

### TaskCard

Displays individual task information in a consistent card format.

**Props:**
- `task` (Task): Task object to display
- `onEdit` (function): Edit callback
- `onDelete` (function): Delete callback
- `onStatusChange` (function): Status change callback
- `onView` (function): View details callback

**Features:**
- Fixed height (256px) for consistent layout
- Click-to-view functionality
- Status and priority indicators
- File attachment preview
- Quick action buttons

### TaskDetailModal

Comprehensive modal for viewing complete task details.

**Props:**
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close callback
- `task` (Task): Task object to display
- `onEdit` (function): Edit callback
- `onDelete` (function): Delete callback
- `onStatusChange` (function): Status change callback

**Features:**
- Read-only detailed view
- File attachment management
- Quick status changes
- Responsive design
- Optimized sizing

### TaskForm

Form component for creating and editing tasks.

**Props:**
- `isOpen` (boolean): Form visibility
- `onClose` (function): Close callback
- `onSubmit` (function): Submit callback
- `initialData` (Task): Initial task data for editing
- `title` (string): Form title

**Features:**
- File upload with progress
- Project selection
- Tag management
- Time estimation
- Form validation

### TaskList

Container component for displaying and managing task collections.

**Props:**
- `projectId` (string): Optional project ID filter

**Features:**
- Drag & drop reordering
- Advanced filtering
- Search functionality
- Responsive grid layout
- Real-time updates

## 🗄️ Database Schema

### Tables

#### user_profiles
Stores user profile information linked to Supabase auth.

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### projects
Stores project information with custom colors.

```sql
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#f2766b',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tasks
Stores task information with relationships to projects.

```sql
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_time INTEGER,
  actual_time INTEGER,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### file_attachments
Stores file attachment information linked to tasks.

```sql
CREATE TABLE file_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_preferences
Stores user-specific application preferences.

```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

- **SELECT**: Users can view their own records
- **INSERT**: Users can create records for themselves
- **UPDATE**: Users can update their own records
- **DELETE**: Users can delete their own records

### Indexes

Optimized indexes for common queries:

```sql
-- Task indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_position ON tasks(position);

-- Project indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);

-- File attachment indexes
CREATE INDEX idx_file_attachments_task_id ON file_attachments(task_id);
CREATE INDEX idx_file_attachments_user_id ON file_attachments(user_id);
```

## 🔐 Authentication

### Supabase Auth Integration

TaskFlow uses Supabase Auth for user authentication with the following features:

- **Email/Password Authentication**: Standard login and registration
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh
- **User Profiles**: Automatic profile creation on signup

### Authentication Flow

1. **Registration**: User signs up with email/password
2. **Profile Creation**: Trigger automatically creates user profile
3. **Login**: User authenticates and receives JWT token
4. **API Requests**: Token included in Authorization header
5. **Server Validation**: API routes validate token and extract user

### Security Features

- **Row Level Security**: Database-level access control
- **JWT Validation**: Server-side token verification
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: All inputs validated and sanitized

## 📁 File Management

### Supabase Storage Integration

File attachments are stored in Supabase Storage with the following structure:

```
task-attachments/
├── {user_id}/
│   └── {task_id}/
│       └── {unique_filename}
```

### File Upload Process

1. **Client Upload**: File selected in TaskForm
2. **Validation**: File size and type validation (10MB limit)
3. **Storage Upload**: File uploaded to Supabase Storage
4. **Database Record**: Attachment metadata stored in database
5. **Error Handling**: Cleanup on failure

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Spreadsheets**: XLS, XLSX
- **Archives**: ZIP

### File Operations

- **Upload**: Multipart form data with progress tracking
- **Download**: Direct download via API endpoint
- **Delete**: Removes from storage and database
- **Preview**: File type icons and size display

## 🛠️ Development Guide

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Supabase account
- Git

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd TaskFlow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Database Setup**
   - Create Supabase project
   - Run `database-schema.sql` in SQL Editor
   - Create `task-attachments` storage bucket

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Code Style Guidelines

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (if configured)
- **JSDoc**: Comprehensive documentation for functions
- **Component Structure**: Functional components with hooks

### Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Building for Production

```bash
# Build application
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add Supabase credentials to Vercel
   - Set production environment variables

3. **Deploy**
   - Automatic deployment on push to main
   - Preview deployments for pull requests

### Other Platforms

TaskFlow can be deployed to any platform supporting Next.js:

- **Netlify**: Static site generation
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform
- **AWS**: Amplify or EC2

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Storage bucket created
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Performance monitoring setup
- [ ] Error tracking configured

## 📊 Performance Considerations

### Optimization Strategies

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Supabase query caching and CDN
- **Lazy Loading**: Component lazy loading where appropriate
- **Bundle Analysis**: Regular bundle size monitoring

### Monitoring

- **Core Web Vitals**: Performance metrics tracking
- **Error Tracking**: Error monitoring and alerting
- **Analytics**: User behavior and usage analytics
- **Database Performance**: Query performance monitoring

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**: Create your fork
2. **Create Branch**: Feature or bugfix branch
3. **Make Changes**: Implement with tests
4. **Test Thoroughly**: Ensure all functionality works
5. **Submit PR**: Detailed description and testing notes

### Code Review Process

- **Automated Checks**: Linting, type checking, tests
- **Manual Review**: Code quality and functionality
- **Testing**: Manual testing of new features
- **Documentation**: Update docs for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check this documentation first
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact the development team

---

**TaskFlow Team** - Building productivity tools for the modern world.
