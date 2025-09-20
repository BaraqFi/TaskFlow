'use client'

import { useState, useEffect } from 'react'
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Folder,
  TrendingUp
} from 'lucide-react'
import StatsCard from './StatsCard'
import { formatDate } from '@/lib/utils'
import { makeAuthenticatedRequest } from '@/lib/api-client'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  tasksDueToday: number
  totalProjects: number
  completionRate: number
  recentTasks: Array<{
    id: string
    title: string
    status: string
    created_at: string
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/dashboard/stats')
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700 animate-pulse">
              <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500 dark:text-secondary-400">
          Failed to load dashboard data
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-100">
          You have {stats.tasksDueToday} tasks due today and {stats.overdueTasks} overdue tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<CheckSquare className="h-6 w-6" />}
          color="primary"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          icon={<CheckSquare className="h-6 w-6" />}
          color="accent"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={<Clock className="h-6 w-6" />}
          color="secondary"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="primary"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Due Today"
          value={stats.tasksDueToday}
          icon={<Calendar className="h-6 w-6" />}
          color="accent"
        />
        <StatsCard
          title="Projects"
          value={stats.totalProjects}
          icon={<Folder className="h-6 w-6" />}
          color="secondary"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="accent"
          trend={{
            value: 12,
            isPositive: true
          }}
        />
      </div>

      {/* Recent Tasks */}
      {stats.recentTasks.length > 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Recent Tasks
          </h2>
          <div className="space-y-3">
            {stats.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    task.status === 'completed' ? 'bg-accent-500' :
                    task.status === 'in-progress' ? 'bg-primary-500' :
                    'bg-secondary-400'
                  }`} />
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {task.title}
                  </span>
                </div>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                  {formatDate(task.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
