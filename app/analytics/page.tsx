'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { makeAuthenticatedRequest } from '@/lib/api-client'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  estimated_time: number | null
  actual_time: number | null
  created_at: string
  updated_at: string
  projects?: {
    id: string
    name: string
    color: string
  }
}

interface Project {
  id: string
  name: string
  color: string
  created_at: string
}

interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
  totalProjects: number
  averageCompletionTime: number
  tasksByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  tasksByProject: Array<{
    projectName: string
    projectColor: string
    taskCount: number
    completedCount: number
  }>
  weeklyActivity: Array<{
    date: string
    created: number
    completed: number
  }>
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, timeRange])

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true)
    try {
      const [tasksResponse, projectsResponse, statsResponse] = await Promise.all([
        makeAuthenticatedRequest('/api/tasks'),
        makeAuthenticatedRequest('/api/projects'),
        makeAuthenticatedRequest('/api/dashboard/stats')
      ])

      const tasks: Task[] = tasksResponse
      const projects: Project[] = projectsResponse
      const stats = statsResponse

      // Process analytics data
      const now = new Date()
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = subDays(now, daysAgo)

      // Filter tasks by time range
      const recentTasks = tasks.filter(task => 
        new Date(task.created_at) >= startDate
      )

      // Calculate metrics
      const totalTasks = recentTasks.length
      const completedTasks = recentTasks.filter(t => t.status === 'completed').length
      const inProgressTasks = recentTasks.filter(t => t.status === 'in-progress').length
      const todoTasks = recentTasks.filter(t => t.status === 'todo').length
      const overdueTasks = recentTasks.filter(t => 
        t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
      ).length

      // Tasks by priority
      const tasksByPriority = {
        low: recentTasks.filter(t => t.priority === 'low').length,
        medium: recentTasks.filter(t => t.priority === 'medium').length,
        high: recentTasks.filter(t => t.priority === 'high').length,
        urgent: recentTasks.filter(t => t.priority === 'urgent').length,
      }

      // Tasks by project
      const projectMap = new Map(projects.map(p => [p.id, p]))
      const tasksByProject = projects.map(project => {
        const projectTasks = recentTasks.filter(t => t.projects?.id === project.id)
        return {
          projectName: project.name,
          projectColor: project.color,
          taskCount: projectTasks.length,
          completedCount: projectTasks.filter(t => t.status === 'completed').length
        }
      }).filter(p => p.taskCount > 0)

      // Weekly activity
      const weeklyActivity = eachDayOfInterval({
        start: startOfWeek(startDate),
        end: endOfWeek(now)
      }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const created = recentTasks.filter(t => 
          format(new Date(t.created_at), 'yyyy-MM-dd') === dateStr
        ).length
        const completed = recentTasks.filter(t => 
          t.status === 'completed' && 
          format(new Date(t.updated_at), 'yyyy-MM-dd') === dateStr
        ).length
        return {
          date: dateStr,
          created,
          completed
        }
      })

      // Average completion time
      const completedTasksWithTime = recentTasks.filter(t => 
        t.status === 'completed' && t.actual_time
      )
      const averageCompletionTime = completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((sum, t) => sum + (t.actual_time || 0), 0) / completedTasksWithTime.length
        : 0

      setAnalyticsData({
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        totalProjects: projects.length,
        averageCompletionTime,
        tasksByPriority,
        tasksByProject,
        weeklyActivity
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              Analytics
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === '7d'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === '30d'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === '90d'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{analyticsData.totalTasks}</p>
                  </div>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analyticsData.completedTasks}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analyticsData.inProgressTasks}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Overdue</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analyticsData.overdueTasks}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tasks by Priority */}
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Tasks by Priority
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.tasksByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          priority === 'urgent' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 capitalize">
                          {priority}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900 dark:text-secondary-100">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks by Project */}
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Tasks by Project
                </h3>
                <div className="space-y-3">
                  {analyticsData.tasksByProject.map((project, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.projectColor }}
                        ></div>
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                          {project.projectName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-secondary-900 dark:text-secondary-100">
                          {project.completedCount}/{project.taskCount}
                        </span>
                        <div className="w-16 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: project.projectColor,
                              width: `${(project.completedCount / project.taskCount) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Weekly Activity
              </h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[400px]">
                  {analyticsData.weeklyActivity.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                        {format(new Date(day.date), 'EEE')}
                      </div>
                      <div className="space-y-1">
                        <div className="h-8 bg-green-100 dark:bg-green-900/20 rounded flex items-end justify-center">
                          <div 
                            className="w-full bg-green-500 rounded-b"
                            style={{ height: `${Math.max(4, (day.completed / Math.max(...analyticsData.weeklyActivity.map(d => d.completed))) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-end justify-center">
                          <div 
                            className="w-full bg-blue-500 rounded-b"
                            style={{ height: `${Math.max(4, (day.created / Math.max(...analyticsData.weeklyActivity.map(d => d.created))) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        {day.completed + day.created}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Created</span>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Projects</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{analyticsData.totalProjects}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Avg. Completion Time</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                      {analyticsData.averageCompletionTime > 0 
                        ? `${Math.round(analyticsData.averageCompletionTime / 60)}h`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Completion Rate</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                      {analyticsData.totalTasks > 0 
                        ? `${Math.round((analyticsData.completedTasks / analyticsData.totalTasks) * 100)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
            <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
              No analytics data available.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
