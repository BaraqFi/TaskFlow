import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color?: 'primary' | 'secondary' | 'accent'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  trend 
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400',
    accent: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
  }

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mt-1">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-1',
              trend.isPositive 
                ? 'text-accent-600 dark:text-accent-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  )
}
