'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  Edit, 
  Trash2, 
  Folder, 
  Calendar,
  CheckSquare,
  MoreVertical
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  is_archived: boolean
  created_at: string
  updated_at: string
  task_count?: number
  completed_tasks?: number
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onArchive: (projectId: string, isArchived: boolean) => void
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onArchive 
}: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project.`)) {
      setIsDeleting(true)
      try {
        await onDelete(project.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleArchive = async () => {
    await onArchive(project.id, !project.is_archived)
  }

  const completionRate = project.task_count && project.task_count > 0 
    ? Math.round((project.completed_tasks || 0) / project.task_count * 100)
    : 0

  return (
    <div className={cn(
      "bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-md transition-all group",
      project.is_archived && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color }}
          >
            <Folder className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(project)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  handleArchive()
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>{project.is_archived ? 'Unarchive' : 'Archive'}</span>
              </button>
              <button
                onClick={() => {
                  handleDelete()
                  setShowMenu(false)
                }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Task Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-secondary-500" />
            <span className="text-secondary-600 dark:text-secondary-400">
              {project.task_count || 0} tasks
            </span>
          </div>
          <span className="text-secondary-500 dark:text-secondary-400">
            {completionRate}% complete
          </span>
        </div>

        {/* Progress Bar */}
        {project.task_count && project.task_count > 0 && (
          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ 
                width: `${completionRate}%`,
                backgroundColor: project.color
              }}
            />
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400">
          <span>Created {formatDate(project.created_at)}</span>
          {project.is_archived && (
            <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-full">
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" className="w-full">
            View Project
          </Button>
        </Link>
      </div>
    </div>
  )
}
