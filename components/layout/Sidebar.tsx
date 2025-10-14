'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Folder, 
  CheckSquare, 
  Calendar, 
  BarChart3,
  Plus,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { makeAuthenticatedRequest } from '@/lib/api-client'

interface Project {
  id: string
  name: string
  color: string
}

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      params.append('include_archived', 'false') // Only show active projects in sidebar
      const data = await makeAuthenticatedRequest(`/api/projects?${params}`)
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: Folder },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]

  return (
    <>
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0 md:flex md:flex-shrink-0'
      )}>
        <div className="p-6 h-full flex flex-col">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Projects Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Projects
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {projects.map((project) => {
                const isActive = pathname === `/projects/${project.id}`
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700'
                    )}
                  >
                    <div
                      className="h-3 w-3 rounded-full mr-3"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
    </>
  )
}
