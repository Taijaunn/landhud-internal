import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { id, cancel } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get the record first to find the file path and status
    const { data: record, error: fetchError } = await supabase
      .from('records')
      .select('source_file_url, file_url, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('[Delete] Failed to fetch record:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    // If cancelling a scrubbing record (status='processing' in DB), just proceed with deletion
    // The database uses 'processing' for scrubbing status
    if (cancel && record.status === 'processing') {
      console.log(`[Delete] Cancelling scrubbing record ${id}`)
    }

    // Delete files from storage if they exist
    const filesToDelete: string[] = []
    
    if (record.source_file_url) {
      // Extract filename from URL
      const sourceFileName = record.source_file_url.split('/').pop()
      if (sourceFileName) filesToDelete.push(sourceFileName)
    }
    
    if (record.file_url) {
      const processedFileName = record.file_url.split('/').pop()
      if (processedFileName) filesToDelete.push(processedFileName)
    }

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('lead-lists')
        .remove(filesToDelete)
      
      if (storageError) {
        console.warn('[Delete] Failed to delete files from storage:', storageError)
        // Continue anyway - record deletion is more important
      }
    }

    // Delete the record from database
    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[Delete] Failed to delete record:', deleteError)
      return NextResponse.json(
        { success: false, error: `Failed to delete record: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log(`[Delete] Successfully deleted record ${id}${cancel ? ' (cancelled)' : ''}`)

    return NextResponse.json({
      success: true,
      message: cancel ? 'Scrubbing cancelled and record deleted' : 'Record deleted successfully'
    })

  } catch (error) {
    console.error('[Delete] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
