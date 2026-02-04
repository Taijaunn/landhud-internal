import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Route segment config
export const runtime = 'nodejs'
export const maxDuration = 60

// N8N webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_LEAD_LIST_WEBHOOK_URL || 'https://landhud.app.n8n.cloud/webhook/lead-list-upload'

// Callback URL for N8N to notify us when processing is complete
const CALLBACK_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// New flow: File is already uploaded to Supabase from the browser
// This endpoint just creates the DB record and triggers N8N
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { fileName, fileUrl, county, state, notes, originalFilename } = body

    // Validation
    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: 'File URL and fileName are required' },
        { status: 400 }
      )
    }

    if (!county || !state) {
      return NextResponse.json(
        { success: false, error: 'County and state are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Create record in database with status='processing'
    const { data: record, error: dbError } = await supabase
      .from('records')
      .insert({
        name: `${county}, ${state} - ${new Date().toLocaleDateString()}`,
        county,
        state,
        status: 'processing',
        source_file_url: fileUrl,
        notes: notes || null,
        date_imported: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Upload] Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('lead-lists').remove([fileName])
      return NextResponse.json(
        { success: false, error: `Failed to create record: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Trigger N8N webhook
    const callbackUrl = `${CALLBACK_BASE_URL}/api/lead-lists/webhook`
    
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: fileUrl,
          county,
          state,
          record_id: record.id,
          callback_url: callbackUrl,
          original_filename: originalFilename || fileName,
          notes: notes || null,
        }),
      })

      if (!n8nResponse.ok) {
        console.warn('[Upload] N8N webhook returned non-OK status:', n8nResponse.status)
      }

      console.log(`[Upload] Successfully triggered N8N webhook for record ${record.id}`)
    } catch (n8nError) {
      console.error('[Upload] Failed to trigger N8N webhook:', n8nError)
    }

    return NextResponse.json({
      success: true,
      recordId: record.id,
      fileName,
      fileUrl,
      message: 'File uploaded successfully. Processing started.',
    })

  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
