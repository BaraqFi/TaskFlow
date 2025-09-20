'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Palette } from 'lucide-react'

interface ProjectFormData {
  name: string
  description: string
  color: string
}

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => Promise<void>
  initialData?: Partial<ProjectFormData>
  title: string
}

const PROJECT_COLORS = [
  '#f2766b', // Primary coral
  '#585166', // Secondary gray
  '#08fb26', // Accent green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#ec4899', // Pink
]

export default function ProjectForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    color: '#f2766b'
  })
  
  const [loading, setLoading] = useState(false)

  // Update form data when initialData changes
  useState(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#f2766b'
      })
    } catch (error) {
      console.error('Error submitting project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Project Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter project name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter project description"
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 resize-none"
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Project Color
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div
                className="h-6 w-6 rounded-full border-2 border-secondary-300 dark:border-secondary-600"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                {formData.color}
              </span>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`
                    h-8 w-8 rounded-full border-2 transition-all hover:scale-110
                    ${formData.color === color 
                      ? 'border-secondary-900 dark:border-secondary-100 shadow-lg' 
                      : 'border-secondary-300 dark:border-secondary-600 hover:border-secondary-500'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
