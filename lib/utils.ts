import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    case 'high':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
    case 'low':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-900/20'
    case 'in-progress':
      return 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
    case 'todo':
      return 'text-secondary-600 bg-secondary-50 dark:text-secondary-400 dark:bg-secondary-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
  }
}
