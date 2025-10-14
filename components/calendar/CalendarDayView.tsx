'use client'

import { format, isSameDay, isToday } from 'date-fns'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
}

interface CalendarDayViewProps {
  tasks: Task[]
  currentDate: Date
  onDateClick: (date: Date) => void
  getPriorityColor: (priority: string) => string
  getStatusColor: (status: string) => string
}

export default function CalendarDayView({ 
  tasks, 
  currentDate, 
  onDateClick, 
  getPriorityColor, 
  getStatusColor 
}: CalendarDayViewProps) {
  const dayTasks = tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), currentDate))

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
          {format(currentDate, 'EEEE, MMMM d')}
        </h2>
      </div>
      {dayTasks.length > 0 ? (
        <div className="space-y-2">
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg ${getStatusColor(task.status)}`}
              onClick={() => onDateClick(new Date(task.due_date!))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  <span className="font-medium">{task.title}</span>
                </div>
                <span className="text-xs">{format(new Date(task.due_date!), 'h:mm a')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
          <p>No tasks for this day.</p>
        </div>
      )}
    </div>
  )
}
