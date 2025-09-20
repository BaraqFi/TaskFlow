/**
 * Tasks API Routes
 * 
 * Handles CRUD operations for tasks including creation, retrieval, updating,
 * and deletion. Supports advanced filtering, search, and task reordering.
 * All endpoints require authentication and enforce user ownership.
 * 
 * @fileoverview API routes for task management operations
 * @author TaskFlow Team
 * @version 2.1.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

/**
 * GET /api/tasks
 * 
 * Retrieves tasks for the authenticated user with optional filtering and search.
 * Supports filtering by project, status, priority, date range, and tags.
 * Results are ordered by position (for drag & drop) and creation date.
 * 
 * Query Parameters:
 * - project_id: Filter tasks by specific project ID
 * - status: Filter by task status (todo, in-progress, completed)
 * - priority: Filter by priority level (low, medium, high, urgent)
 * - search: Search in task title and description
 * - date_filter: Filter by date range (today, tomorrow, this_week, etc.)
 * - tag_filter: Filter by specific tag
 * 
 * @param request - Next.js request object with query parameters
 * @returns JSON response with filtered tasks array
 * @throws 401 if user is not authenticated
 * @throws 500 if database operation fails
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const dateFilter = searchParams.get('date_filter')
    const tagFilter = searchParams.get('tag_filter')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (dateFilter) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      switch (dateFilter) {
        case 'today':
          query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
          break
        case 'tomorrow':
          query = query.gte('due_date', tomorrow.toISOString()).lt('due_date', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString())
          break
        case 'this_week':
          query = query.gte('due_date', today.toISOString()).lt('due_date', nextWeek.toISOString())
          break
        case 'next_week':
          query = query.gte('due_date', nextWeek.toISOString()).lt('due_date', new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
          break
        case 'this_month':
          query = query.gte('due_date', today.toISOString()).lt('due_date', nextMonth.toISOString())
          break
        case 'overdue':
          query = query.lt('due_date', today.toISOString())
          break
        case 'no_due_date':
          query = query.is('due_date', null)
          break
      }
    }

    if (tagFilter) {
      query = query.contains('tags', [tagFilter])
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(tasks)
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

/**
 * POST /api/tasks
 * 
 * Creates a new task for the authenticated user. Validates required fields
 * and sets default values for optional fields. Automatically assigns the
 * task to the authenticated user.
 * 
 * Request Body:
 * - title: Task title (required)
 * - description: Task description (optional)
 * - status: Task status (default: 'todo')
 * - priority: Priority level (default: 'medium')
 * - due_date: Due date in ISO format (optional)
 * - estimated_time: Estimated time in minutes (optional)
 * - project_id: Project ID to assign task to (optional)
 * - tags: Array of tag strings (optional)
 * - position: Position for drag & drop ordering (optional)
 * 
 * @param request - Next.js request object with task data in body
 * @returns JSON response with created task data
 * @throws 400 if required fields are missing
 * @throws 401 if user is not authenticated
 * @throws 500 if database operation fails
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)

    const body = await request.json()
    const { 
      title, 
      description, 
      project_id, 
      status, 
      priority, 
      due_date, 
      estimated_time, 
      tags 
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    // Get the next position for the task
    const { data: lastTask } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', user.id)
      .eq('project_id', project_id || null)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (lastTask?.position || 0) + 1

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        project_id,
        status: status || 'todo',
        priority: priority || 'medium',
        due_date,
        estimated_time,
        tags: tags || [],
        position: nextPosition
      })
      .select(`
        *,
        projects (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(task, { status: 201 })
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
