import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request)
    const filename = params.filename

    // Find the attachment record to get the full file path and original filename
    const { data: attachment, error: fetchError } = await supabase
      .from('file_attachments')
      .select('file_path, original_filename, mime_type')
      .eq('filename', filename)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 })
    }

    const { data, error: downloadError } = await supabase.storage
      .from('task-attachments')
      .download(attachment.file_path)

    if (downloadError) {
      console.error('Supabase download error:', downloadError)
      return NextResponse.json({ error: downloadError.message }, { status: 500 })
    }

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', attachment.mime_type)
    headers.set('Content-Disposition', `attachment; filename="${attachment.original_filename}"`)

    return new NextResponse(data, { headers })
  } catch (error) {
    console.error('File download API error:', error)
    if (error instanceof Error && error.message === 'No authorization header') {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}