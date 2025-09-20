/**
 * TaskDetailModal Component
 * 
 * A comprehensive modal for viewing complete task details in a read-only format.
 * Displays all task information including metadata, attachments, project details,
 * and time tracking. Provides quick actions for status changes and task management.
 * 
 * @fileoverview Modal component for detailed task viewing and management
 * @author TaskFlow Team
 * @version 2.1.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  Tag, 
  Paperclip,
  Download,
  X,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  PlayCircle,
  AlertTriangle,
  User,
  Folder
} from 'lucide-react'
import { format } from 'date-fns'
import { makeAuthenticatedRequest } from '@/lib/api-client'

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
  position: number
  tags: string[]
  created_at: string
  updated_at: string
  projects?: Project
  attachments?: Attachment[]
}

/**
 * Props interface for the TaskDetailModal component
 */
interface TaskDetailModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Callback function to close the modal */
  onClose: () => void
  /** The task object to display details for */
  task: Task | null
  /** Callback function when edit button is clicked */
  onEdit: (task: Task) => void
  /** Callback function when delete button is clicked */
  onDelete: (taskId: string) => void
  /** Callback function when task status is changed */
  onStatusChange: (taskId: string, status: string) => void
}

export default function TaskDetailModal({ 
  isOpen, 
  onClose, 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: TaskDetailModalProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || [])
  const [loadingAttachments, setLoadingAttachments] = useState(false)

  useEffect(() => {
    if (isOpen && task) {
      fetchAttachments()
    }
  }, [isOpen, task])

  const fetchAttachments = async () => {
    if (!task) return
    
    setLoadingAttachments(true)
    try {
      const data = await makeAuthenticatedRequest(`/api/tasks/${task.id}/attachments`)
      setAttachments(data)
    } catch (error) {
      console.error('Error fetching attachments:', error)
    } finally {
      setLoadingAttachments(false)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in-progress': return <PlayCircle className="h-4 w-4" />
      case 'todo': return <Circle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = `/api/files/${attachment.filename}`
    link.download = attachment.original_filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return
    
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

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return
    await onStatusChange(task.id, newStatus)
    onClose()
  }

  const handleEdit = () => {
    if (!task) return
    onEdit(task)
    onClose()
  }

  const handleDelete = async () => {
    if (!task) return
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id)
      onClose()
    }
  }

  if (!task) return null

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" className="max-w-3xl max-h-[90vh]">
      <div className="space-y-4 p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {task.title}
            </h1>
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="ml-2 capitalize">{task.status.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 capitalize">
                  {task.priority} Priority
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Description
            </h3>
            <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-3">
              <p className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>
        )}

        {/* Project Information */}
        {task.projects && (
          <div>
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Project
            </h3>
            <div className="flex items-center space-x-3 p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: task.projects.color }}
              ></div>
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {task.projects.name}
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Time Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Time Information
            </h3>
            <div className="space-y-2">
              {task.due_date && (
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-secondary-50 dark:bg-secondary-700'
                }`}>
                  <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-secondary-500 dark:text-secondary-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">Due Date</p>
                    <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-secondary-900 dark:text-secondary-100'}`}>
                      {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              
              {task.estimated_time && (
                <div className="flex items-center space-x-2 p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <Clock className="h-4 w-4 text-secondary-500 dark:text-secondary-400" />
                  <div>
                    <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">Estimated Time</p>
                    <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {formatTime(task.estimated_time)}
                    </p>
                  </div>
                </div>
              )}

              {task.actual_time && (
                <div className="flex items-center space-x-2 p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <Clock className="h-4 w-4 text-secondary-500 dark:text-secondary-400" />
                  <div>
                    <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">Actual Time</p>
                    <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {formatTime(task.actual_time)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Attachments
            </h3>
            {loadingAttachments ? (
              <div className="flex items-center justify-center p-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            ) : attachments.length > 0 ? (
              <div className="space-y-1">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {attachment.original_filename.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-secondary-900 dark:text-secondary-100 truncate">
                          {attachment.original_filename}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          {formatFileSize(attachment.file_size)} • {format(new Date(attachment.created_at), 'MMM dd')}
                        </p>
                      </div>
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
              </div>
            ) : (
              <div className="text-center py-4 text-secondary-500 dark:text-secondary-400">
                <Paperclip className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p className="text-sm">No attachments</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-secondary-200 dark:border-secondary-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-secondary-500 dark:text-secondary-400">
            <div>
              <span className="font-medium">Created:</span> {format(new Date(task.created_at), 'MMM dd, yyyy • h:mm a')}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {format(new Date(task.updated_at), 'MMM dd, yyyy • h:mm a')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-3 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleStatusChange(task.status === 'completed' ? 'todo' : 'completed')}
            >
              {task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
            </Button>
            {task.status === 'todo' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('in-progress')}
              >
                Start Task
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
