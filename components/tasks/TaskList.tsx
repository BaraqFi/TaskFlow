'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import TaskDetailModal from './TaskDetailModal'
import { Plus, Search, Filter, SortAsc } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeAuthenticatedRequest } from '@/lib/api-client'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface Project {
  id: string
  name: string
  color: string
}

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
  projects?: Project
}

interface TaskListProps {
  projectId?: string
}

export default function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('position')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [projectId, statusFilter, priorityFilter, searchQuery, sortBy, dateFilter, tagFilter])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (projectId) params.append('project_id', projectId)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchQuery) params.append('search', searchQuery)
      if (sortBy) params.append('sort', sortBy)
      if (dateFilter !== 'all') params.append('date_filter', dateFilter)
      if (tagFilter) params.append('tag_filter', tagFilter)
      
      const data = await makeAuthenticatedRequest(`/api/tasks?${params}`)
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (formData: any) => {
    try {
      // Set position to the end of the list
      const maxPosition = tasks.length > 0 ? Math.max(...tasks.map(t => t.position || 0)) : -1
      
      await makeAuthenticatedRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          project_id: projectId || formData.project_id,
          position: maxPosition + 1
        }),
      })
      await fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (formData: any) => {
    if (!editingTask) return

    try {
      await makeAuthenticatedRequest(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })
      await fetchTasks()
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await makeAuthenticatedRequest(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await makeAuthenticatedRequest(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      await fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceIndex = source.index
    const destinationIndex = destination.index

    if (sourceIndex === destinationIndex) return

    // Create a new array with reordered tasks
    const newTasks = Array.from(filteredTasks)
    const [reorderedTask] = newTasks.splice(sourceIndex, 1)
    newTasks.splice(destinationIndex, 0, reorderedTask)

    // Update positions in the new array
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      position: index
    }))

    // Update local state immediately for better UX
    setTasks(prev => {
      const taskMap = new Map(updatedTasks.map(task => [task.id, task]))
      return prev.map(task => taskMap.get(task.id) || task)
    })

    // Update positions in the database
    try {
      await makeAuthenticatedRequest('/api/tasks/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          taskIds: updatedTasks.map(task => task.id)
        })
      })
    } catch (error) {
      console.error('Error reordering tasks:', error)
      // Revert on error
      fetchTasks()
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleViewTask = (task: Task) => {
    setViewingTask(task)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setViewingTask(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    }
  }

  const counts = getTaskCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            {projectId ? 'Project Tasks' : 'All Tasks'}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {counts.total} tasks • {counts.todo} to do • {counts.inProgress} in progress • {counts.completed} completed
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
            >
              <option value="position">Custom Order</option>
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Filter className="h-4 w-4" />
              <span>Advanced Filters</span>
            </button>
            
            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all' || tagFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
                  setDateFilter('all')
                  setTagFilter('')
                }}
                className="text-sm text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Due Date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="next_week">Next Week</option>
                  <option value="this_month">This Month</option>
                  <option value="overdue">Overdue</option>
                  <option value="no_due_date">No Due Date</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Tag
                </label>
                <Input
                  placeholder="Filter by tag..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 animate-pulse">
              <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-secondary-400 dark:text-secondary-500 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No tasks found
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400 mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first task.'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]",
                  snapshot.isDraggingOver && "bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                )}
              >
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "transition-transform duration-200",
                          snapshot.isDragging && "rotate-2 scale-105 shadow-lg"
                        )}
                      >
                        <TaskCard
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleStatusChange}
                          onView={handleViewTask}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        task={viewingTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
