'use client'

import { useAuth } from '@/contexts/AuthContext'
import AuthPage from '@/components/auth/AuthPage'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
