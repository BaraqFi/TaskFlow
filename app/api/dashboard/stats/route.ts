import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)

    // Get total tasks count
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get completed tasks count
    const { count: completedTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    // Get in-progress tasks count
    const { count: inProgressTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'in-progress')

    // Get overdue tasks count
    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'todo')
      .lt('due_date', new Date().toISOString())

    // Get tasks due today
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { count: tasksDueToday } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .gte('due_date', startOfDay.toISOString())
      .lt('due_date', endOfDay.toISOString())

    // Get total projects count
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false)

    // Calculate completion rate
    const completionRate = totalTasks ? Math.round((completedTasks || 0) / totalTasks * 100) : 0

    // Get recent tasks (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    const stats = {
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      inProgressTasks: inProgressTasks || 0,
      overdueTasks: overdueTasks || 0,
      tasksDueToday: tasksDueToday || 0,
      totalProjects: totalProjects || 0,
      completionRate,
      recentTasks: recentTasks || []
    }

    return NextResponse.json(stats)
  } catch (error) {
    if (error instanceof Error && error.message === 'No authorization header') {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
