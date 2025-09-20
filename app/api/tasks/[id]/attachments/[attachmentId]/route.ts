import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)
    const { id: taskId, attachmentId } = await params

    // First, retrieve the attachment record to get the file_path
    const { data: attachment, error: fetchError } = await supabase
      .from('file_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'Attachment not found or unauthorized' }, { status: 404 })
    }

    // Delete the file from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('task-attachments')
      .remove([attachment.file_path])

    if (storageError) {
      console.error('Supabase storage deletion error:', storageError)
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }

    // Delete the attachment record from the database
    const { error: dbError } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('task_id', taskId)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Attachment deleted successfully' })
  } catch (error) {
    console.error('File attachment deletion API error:', error)
    if (error instanceof Error && error.message === 'No authorization header') {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}