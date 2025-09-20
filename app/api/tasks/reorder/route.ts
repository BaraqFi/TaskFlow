import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)

    const body = await request.json()
    const { taskIds } = body

    if (!taskIds || !Array.isArray(taskIds)) {
      return NextResponse.json({ error: 'Task IDs array is required' }, { status: 400 })
    }

    // Update positions for all tasks
    const updates = taskIds.map((taskId: string, index: number) => ({
      id: taskId,
      position: index
    }))

    // Update each task's position
    for (const update of updates) {
      const { error } = await supabase
        .from('tasks')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ message: 'Tasks reordered successfully' })
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
