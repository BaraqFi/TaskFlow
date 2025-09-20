/**
 * TaskCard Component
 * 
 * A comprehensive task display card that shows task information in a consistent,
 * clickable format. Features include status management, file attachments,
 * priority indicators, and quick actions.
 * 
 * @fileoverview Displays individual task information with interactive elements
 * @author TaskFlow Team
 * @version 2.1.0
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle,
  PlayCircle,
  AlertTriangle,
  Tag,
  Paperclip,
  Download,
  X
} from 'lucide-react'
import { formatDate, formatTime, getPriorityColor, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * Project interface representing a project that tasks can belong to
 */
interface Project {
  id: string
  name: string
  color: string
}

/**
 * Attachment interface representing file attachments for tasks
 */
interface Attachment {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  created_at: string
}

/**
 * Task interface representing a complete task with all its properties
 */
interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  estimated_time: number | null
  actual_time: number | null
  tags: string[]
  created_at: string
  updated_at: string
  projects?: Project
  attachments?: Attachment[]
}

/**
 * Props interface for the TaskCard component
 */
interface TaskCardProps {
  /** The task object to display */
  task: Task
  /** Callback function when edit button is clicked */
  onEdit: (task: Task) => void
  /** Callback function when delete button is clicked */
  onDelete: (taskId: string) => void
  /** Callback function when task status is changed */
  onStatusChange: (taskId: string, status: string) => void
  /** Optional callback function when task card is clicked to view details */
  onView?: (task: Task) => void
}

/**
 * TaskCard Component
 * 
 * Renders a task card with consistent height and layout, displaying task information
 * including title, description, status, priority, due date, and attachments.
 * Supports click-to-view functionality and quick actions.
 * 
 * @param props - TaskCardProps object containing task data and callback functions
 * @returns JSX element representing the task card
 */
export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onView }: TaskCardProps) {
  // State management for component interactions
  const [isDeleting, setIsDeleting] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments || [])
  const [loadingAttachments, setLoadingAttachments] = useState(false)

  /**
   * Handles task deletion with confirmation dialog
   * @async
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true)
      try {
        await onDelete(task.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  /**
   * Downloads a file attachment by creating a temporary download link
   * @param attachment - The attachment object to download
   */
  const handleDownloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = `/api/files/${attachment.filename}`
    link.download = attachment.original_filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Deletes a file attachment with confirmation
   * @param attachmentId - The ID of the attachment to delete
   * @async
   */
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const response = await fetch(`/api/tasks/${task.id}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          }
        })
        
        if (response.ok) {
          setAttachments(prev => prev.filter(att => att.id !== attachmentId))
        }
      } catch (error) {
        console.error('Error deleting attachment:', error)
      }
    }
  }

  /**
   * Handles task status changes
   * @param newStatus - The new status to set for the task
   * @async
   */
  const handleStatusChange = async (newStatus: string) => {
    await onStatusChange(task.id, newStatus)
  }

  /**
   * Returns the appropriate status icon based on task status
   * @param status - The task status
   * @returns JSX element for the status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-accent-500" />
      case 'in-progress':
        return <PlayCircle className="h-4 w-4 text-primary-500" />
      default:
        return <Circle className="h-4 w-4 text-secondary-400" />
    }
  }

  /**
   * Returns priority icon for urgent tasks
   * @param priority - The task priority level
   * @returns JSX element for priority icon or null
   */
  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  // Check if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  /**
   * Handles card click events, opening detail view if onView callback is provided
   * Prevents triggering when clicking on interactive elements
   * @param e - Mouse event
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    onView?.(task)
  }

  return (
    <div 
      className={cn(
        "bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 hover:shadow-md transition-shadow cursor-pointer h-64 flex flex-col",
        isOverdue && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={() => handleStatusChange(task.status === 'completed' ? 'todo' : 'completed')}
            className="hover:opacity-70 transition-opacity"
          >
            {getStatusIcon(task.status)}
          </button>
          
          <div className="flex-1">
            <h3 className={cn(
              "font-medium text-secondary-900 dark:text-secondary-100",
              task.status === 'completed' && "line-through text-secondary-500 dark:text-secondary-400"
            )}>
              {task.title}
            </h3>
            
            {task.projects && (
              <div className="flex items-center space-x-1 mt-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.projects.color }}
                />
                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                  {task.projects.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {getPriorityIcon(task.priority)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area - Flexible */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Description */}
        {task.description && (
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-auto pt-3 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-2 mb-2">
              <Paperclip className="h-3 w-3 text-secondary-500 dark:text-secondary-400" />
              <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                Attachments ({attachments.length})
              </span>
            </div>
            <div className="space-y-1">
              {attachments.slice(0, 2).map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700 rounded text-xs">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {attachment.original_filename.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate text-secondary-700 dark:text-secondary-300">
                      {attachment.original_filename}
                    </span>
                    <span className="text-secondary-500 dark:text-secondary-400 flex-shrink-0">
                      ({(attachment.file_size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="p-1 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500"
                      title="Delete"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {attachments.length > 2 && (
                <div className="text-xs text-secondary-500 dark:text-secondary-400 text-center">
                  +{attachments.length - 2} more attachments
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400 mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {task.due_date && (
            <div className={cn(
              "flex items-center space-x-1",
              isOverdue && "text-red-500 dark:text-red-400"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
          
          {task.estimated_time && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(task.estimated_time)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(task.status)
          )}>
            {task.status.replace('-', ' ')}
          </span>
          
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getPriorityColor(task.priority)
          )}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  )
}
