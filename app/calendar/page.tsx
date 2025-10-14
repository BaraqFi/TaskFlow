'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { makeAuthenticatedRequest } from '@/lib/api-client'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { Button } from '@/components/ui/Button'
import TaskForm from '@/components/tasks/TaskForm'
import CalendarDayView from '@/components/calendar/CalendarDayView'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  estimated_time: number | null
  actual_time: number | null
  position: number
  tags: string[]
  created_at: string
  updated_at: string
  projects?: {
    id: string
    name: string
    color: string
  }
}

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, currentDate])

  const fetchTasks = async () => {
    setLoadingTasks(true)
    try {
      const data = await makeAuthenticatedRequest('/api/tasks')
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false
      return isSameDay(new Date(task.due_date), date)
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const handleCreateTask = async (formData: any) => {
    try {
      await makeAuthenticatedRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          due_date: selectedDate?.toISOString()
        }),
      })
      await fetchTasks()
      setIsFormOpen(false)
      setSelectedDate(null)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsFormOpen(true)
  }

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // Add empty days at the beginning to align with weekday
  const startOfMonthDate = startOfMonth(currentDate)
  const startDay = startOfMonthDate.getDay()
  const emptyDays = Array.from({ length: startDay }, (_, i) => null)

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
              Calendar
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'month'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'week'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          {isMobile ? (
            <CalendarDayView 
              tasks={tasks}
              currentDate={currentDate}
              onDateClick={handleDateClick}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
            />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-secondary-200 dark:bg-secondary-700 rounded-lg overflow-hidden">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-secondary-100 dark:bg-secondary-800 p-3 text-center text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {day}
                </div>
              ))}

              {/* Empty days at the beginning */}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="bg-white dark:bg-secondary-800 h-24"></div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day) => {
                const dayTasks = getTasksForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`bg-white dark:bg-secondary-800 h-24 p-1 border-r border-b border-secondary-200 dark:border-secondary-700 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-700 ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } ${isCurrentDay ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isCurrentDay 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-secondary-900 dark:text-secondary-100'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${getStatusColor(task.status)}`}
                          title={task.title}
                        >
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedDate(null)
          }}
          onSubmit={handleCreateTask}
          title="Create New Task"
        />
      </div>
    </Layout>
  )
}
