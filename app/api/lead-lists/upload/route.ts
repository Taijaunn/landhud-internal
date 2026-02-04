import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// N8N webhook URL - update this after setting up the workflow
const N8N_WEBHOOK_URL = process.env.N8N_LEAD_LIST_WEBHOOK_URL || 'https://landhud.app.n8n.cloud/webhook/lead-list-upload'

// Callback URL for N8N to notify us when processing is complete
const CALLBACK_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File | null
    const county = formData.get('county') as string | null
    const state = formData.get('state') as string | null
    const notes = formData.get('notes') as string | null

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!county || !state) {
      return NextResponse.json(
        { success: false, error: 'County and state are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedCounty = county.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const sanitizedState = state.toLowerCase()
    const fileName = `${sanitizedCounty}-${sanitizedState}-${timestamp}${fileExtension}`

    // Determine content type
    const contentTypeMap: Record<string, string> = {
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
    }
    const contentType = contentTypeMap[fileExtension] || 'application/octet-stream'

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (lead-lists bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lead-lists')
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError)
      return NextResponse.json(
        { success: false, error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('lead-lists')
      .getPublicUrl(fileName)

    const fileUrl = urlData?.publicUrl

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
          original_filename: file.name,
          notes: notes || null,
        }),
      })

      if (!n8nResponse.ok) {
        console.warn('[Upload] N8N webhook returned non-OK status:', n8nResponse.status)
        // Don't fail the request - the file is uploaded and record created
        // N8N can be triggered manually if needed
      }

      console.log(`[Upload] Successfully triggered N8N webhook for record ${record.id}`)
    } catch (n8nError) {
      console.error('[Upload] Failed to trigger N8N webhook:', n8nError)
      // Don't fail the request - file is uploaded, N8N can be triggered manually
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
