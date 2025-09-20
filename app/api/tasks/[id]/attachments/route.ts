import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)
    const { id: taskId } = await params

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${user.id}/${taskId}/${uniqueFileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Insert attachment record into database
    const { data: attachment, error: dbError } = await supabase
      .from('file_attachments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        filename: uniqueFileName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: filePath,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Attempt to delete the uploaded file if DB insert fails
      await supabase.storage.from('task-attachments').remove([filePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('File upload API error:', error)
    if (error instanceof Error && error.message === 'No authorization header') {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)
    const { id: taskId } = await params

    // Get attachments for the task
    const { data: attachments, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('File attachments fetch API error:', error)
    if (error instanceof Error && error.message === 'No authorization header') {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}