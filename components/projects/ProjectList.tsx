'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import { Plus, Search, Archive, Folder } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/api-client'

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

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('include_archived', 'true')
      const data = await makeAuthenticatedRequest(`/api/projects?${params}`)
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (formData: any) => {
    try {
      await makeAuthenticatedRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      await fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  const handleUpdateProject = async (formData: any) => {
    if (!editingProject) return

    try {
      await makeAuthenticatedRequest(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })
      await fetchProjects()
      setEditingProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await makeAuthenticatedRequest(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  const handleArchiveProject = async (projectId: string, isArchived: boolean) => {
    try {
      await makeAuthenticatedRequest(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_archived: isArchived }),
      })
      await fetchProjects()
    } catch (error) {
      console.error('Error archiving project:', error)
      throw error
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProject(null)
  }

  const filteredProjects = projects.filter(project => {
    if (!showArchived && project.is_archived) return false
    if (showArchived && !project.is_archived) return false
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !project.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const activeProjects = projects.filter(p => !p.is_archived)
  const archivedProjects = projects.filter(p => p.is_archived)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Projects
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {activeProjects.length} active projects • {archivedProjects.length} archived
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Archive Toggle */}
          <Button
            variant={showArchived ? "primary" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-full"></div>
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-secondary-400 dark:text-secondary-500 mb-4">
            <Folder className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {showArchived ? 'No archived projects' : 'No projects found'}
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400 mb-4">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : showArchived
              ? 'Archived projects will appear here.'
              : 'Get started by creating your first project.'}
          </p>
          {!searchQuery && !showArchived && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onArchive={handleArchiveProject}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        initialData={editingProject || undefined}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      />
    </div>
  )
}
