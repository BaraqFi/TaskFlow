# TaskFlow - Smart Personal Task Manager

A modern, lightweight task management application designed for students and young professionals. Built with Next.js 15 and Supabase, TaskFlow provides an intuitive interface for organizing tasks, managing projects, and tracking productivity without the complexity of enterprise tools.

## ✨ Features Implemented

### 🎯 Core Task Management
- **Complete CRUD Operations**: Create, read, update, and delete tasks
- **Task Status Management**: Todo, In Progress, and Completed states
- **Priority Levels**: Low, Medium, High, and Urgent priorities
- **Due Date Tracking**: Set and manage task deadlines
- **Time Estimation**: Track estimated vs actual time spent
- **Tag System**: Organize tasks with custom tags

### 📁 Project Organization
- **Project Creation**: Create projects with custom names and colors
- **Task Assignment**: Assign tasks to specific projects
- **Project Archiving**: Archive and restore projects
- **Project-based Filtering**: View tasks by project

### 📎 File Management
- **File Attachments**: Upload files up to 10MB per task
- **Multiple File Types**: Support for images, documents, PDFs, and archives
- **File Preview**: Visual file type indicators and size display
- **Download/Delete**: Manage attachments directly from tasks
- **Supabase Storage**: Cloud-based file storage with proper security

### 🎨 User Interface
- **Task Detail Modal**: Comprehensive read-only task viewing
- **Drag & Drop Reordering**: Intuitive task position management
- **Advanced Filtering**: Filter by status, priority, date range, and tags
- **Search Functionality**: Search tasks by title and description
- **Responsive Design**: Optimized for desktop and mobile
- **Dark/Light Mode**: Theme switching with system preference detection

### 📊 Analytics & Views
- **Dashboard Analytics**: Key metrics and productivity insights
- **Calendar View**: Visual task scheduling with monthly calendar
- **Task Statistics**: Completion rates, overdue tasks, and trends
- **Project Progress**: Track project completion and task distribution
- **Weekly Activity**: Visual activity charts and patterns

### 🔐 Security & Performance
- **User Authentication**: Secure JWT-based authentication
- **Row Level Security**: Database-level access control
- **File Security**: User-owned file storage with proper permissions
- **Optimistic UI**: Real-time updates with instant feedback
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Technologies Used

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict checking
- **TailwindCSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon system

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
  - **PostgreSQL**: Relational database with advanced features
  - **Supabase Auth**: JWT-based authentication system
  - **Supabase Storage**: Cloud file storage with CDN
  - **Row Level Security**: Database-level access control

### Additional Libraries
- **react-beautiful-dnd**: Drag and drop functionality
- **date-fns**: Date manipulation and formatting
- **uuid**: Unique identifier generation
- **clsx & tailwind-merge**: Conditional CSS class management

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Static type checking
- **Git**: Version control
- **Vercel**: Deployment platform (recommended)

## 🚀 Setup and Run Instructions

### Prerequisites
- **Node.js 18+** (LTS version recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** (free tier available)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TaskFlow
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Run Database Schema**:
   - Navigate to **SQL Editor** in your Supabase dashboard
   - Copy the contents of `database-schema.sql`
   - Paste and run the SQL script
   - This creates all necessary tables, policies, and functions

3. **Create Storage Bucket**:
   - Go to **Storage** in your Supabase dashboard
   - Create a new bucket named `task-attachments`
   - Set the bucket to **public** (or configure RLS policies)

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 6. Access the Application
Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### 7. Create Your Account
- Click "Sign Up" to create a new account
- Verify your email (if email confirmation is enabled)
- Start creating tasks and projects!

### 8. Production Deployment
For production deployment, see the [Complete Documentation](DOCUMENTATION.md) for detailed instructions on deploying to Vercel, Netlify, or other platforms.

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

## 🤖 AI Usage and Development Context

### AI Tools and Contexts Used

This project was developed with significant AI assistance using various tools and contexts:

#### **Code Generation and Architecture**
- **Component Development**: AI-assisted creation of React components with TypeScript
- **API Route Design**: Automated generation of Next.js API routes with proper authentication
- **Database Schema**: AI-generated PostgreSQL schema with RLS policies and relationships
- **Authentication Flow**: JWT-based auth implementation with Supabase integration

#### **UI/UX Design and Implementation**
- **Design System**: AI-assisted creation of consistent color palette and component styling
- **Responsive Layout**: Automated responsive design implementation with TailwindCSS
- **Component Architecture**: Structured component hierarchy with proper prop interfaces
- **User Experience**: AI-guided UX improvements and accessibility considerations

#### **Documentation and Code Quality**
- **JSDoc Comments**: Comprehensive function and component documentation
- **API Documentation**: Detailed endpoint documentation with examples
- **Changelog Creation**: AI-generated version history and feature tracking
- **Code Comments**: Inline documentation for complex logic and business rules

#### **Problem Solving and Debugging**
- **Error Resolution**: AI-assisted debugging of authentication and database issues
- **Performance Optimization**: Code optimization suggestions and implementation
- **Security Implementation**: AI-guided security best practices and RLS policies
- **File Upload Logic**: Complex file handling and storage integration

#### **Development Workflow**
- **Iterative Development**: AI-assisted feature implementation and refinement
- **Code Refactoring**: Automated code improvements and structure optimization
- **Testing Strategy**: AI-guided testing approaches and error handling
- **Deployment Preparation**: Production-ready code and deployment strategies

### AI Development Approach

The development process leveraged AI in several key areas:

1. **Rapid Prototyping**: Quick iteration on features and components
2. **Best Practices**: Implementation of modern React and Next.js patterns
3. **Security Focus**: AI-guided security implementation and validation
4. **Documentation**: Comprehensive documentation generation and maintenance
5. **Code Quality**: Consistent code style and TypeScript implementation

### Human-AI Collaboration

This project demonstrates effective human-AI collaboration where:
- **Human Direction**: Project vision, requirements, generated code review and editing, and user experience decisions
- **AI Implementation**: Code generation, documentation, and technical problem-solving
- **Iterative Refinement**: Continuous improvement based on user feedback and testing
- **Quality Assurance**: Human review and testing of AI-generated code

**Note**: Our API integration is entirely manually implemented with custom helper functions and direct HTTP requests.

## 📚 Documentation

- **[Complete Documentation](DOCUMENTATION.md)** - Comprehensive guide covering architecture, API, components, and deployment
- **[Changelog](CHANGELOG.md)** - Detailed version history and feature updates
- **[Database Schema](database-schema.sql)** - Complete database structure with setup instructions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- Icons by Lucide React
- Styled with TailwindCSS
