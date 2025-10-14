'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import TaskList from '@/components/tasks/TaskList'
import { ArrowLeft, Folder } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { makeAuthenticatedRequest } from '@/lib/api-client'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export default function ProjectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    setProjectLoading(true)
    try {
      const data = await makeAuthenticatedRequest(`/api/projects/${projectId}`)
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/projects')
    } finally {
      setProjectLoading(false)
    }
  }

  if (loading || projectLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Project not found
          </h1>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <Folder className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-secondary-600 dark:text-secondary-400">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tasks for this project */}
        <TaskList projectId={projectId} />
      </div>
    </Layout>
  )
}
