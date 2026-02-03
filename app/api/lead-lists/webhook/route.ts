import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// In-memory store for server-side (legacy support for old UI)
// In production, this is replaced by Supabase
let leadListsData: any[] = []

// GET: Fetch all lead lists (combines in-memory + database)
export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Fetch from database
    const { data: dbRecords, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[Webhook GET] Database error:', error)
    }

    // Transform database records to LeadList format
    const dbLists = (dbRecords || []).map(record => ({
      id: record.id,
      fileName: record.name || 'Unnamed List',
      originalFileName: record.name,
      source: 'landportal',
      status: mapStatus(record.status),
      recordCount: record.record_count,
      county: record.county,
      state: record.state,
      receivedAt: record.created_at,
      processedAt: record.updated_at,
      downloadUrl: record.file_url,
      sourceFileUrl: record.source_file_url,
      errorMessage: record.error_message,
    }))

    // Combine with in-memory data (for backwards compatibility)
    const allLists = [...dbLists]
    leadListsData.forEach(memList => {
      if (!allLists.find(l => l.id === memList.id)) {
        allLists.push(memList)
      }
    })

    return NextResponse.json({ 
      success: true, 
      lists: allLists,
      count: allLists.length 
    })
  } catch (error) {
    console.error('[Webhook GET] Unexpected error:', error)
    return NextResponse.json({ 
      success: true, 
      lists: leadListsData,
      count: leadListsData.length 
    })
  }
}

// POST: Handle incoming webhooks from N8N (callback after processing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is an N8N callback (has record_id)
    if (body.record_id) {
      return handleN8NCallback(body)
    }
    
    // Legacy: Handle direct list registration (old format)
    return handleLegacyRegistration(body)

  } catch (error) {
    console.error('[Webhook POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// Handle N8N callback when processing is complete
async function handleN8NCallback(body: any) {
  const {
    record_id,
    status,
    clean_file_url,
    record_count,
    error_message,
  } = body

  console.log(`[Webhook] N8N callback for record ${record_id}:`, { status, record_count })

  const supabase = createServerClient()

  // Determine final status
  let finalStatus = 'ready'
  if (status === 'error' || error_message) {
    finalStatus = 'error'
  } else if (status === 'ready' || status === 'complete' || status === 'success') {
    finalStatus = 'ready'
  }

  // Update the record
  const updateData: any = {
    status: finalStatus,
    updated_at: new Date().toISOString(),
  }

  if (clean_file_url) {
    updateData.file_url = clean_file_url
  }

  if (record_count) {
    updateData.record_count = parseInt(record_count, 10)
  }

  if (error_message) {
    updateData.error_message = error_message
  }

  const { data: updatedRecord, error } = await supabase
    .from('records')
    .update(updateData)
    .eq('id', record_id)
    .select()
    .single()

  if (error) {
    console.error('[Webhook] Failed to update record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update record' },
      { status: 500 }
    )
  }

  console.log(`[Webhook] Record ${record_id} updated to status: ${finalStatus}`)

  return NextResponse.json({
    success: true,
    message: 'Record updated successfully',
    record: updatedRecord,
  })
}

// Legacy: Handle direct list registration (backwards compatibility)
async function handleLegacyRegistration(body: any) {
  const {
    fileName,
    originalFileName,
    source = 'landportal',
    status = 'incoming',
    recordCount,
    county,
    state,
    downloadUrl,
    metadata
  } = body

  if (!fileName) {
    return NextResponse.json(
      { success: false, error: 'fileName is required' },
      { status: 400 }
    )
  }

  const id = Math.random().toString(36).substring(2, 15)
  const newList = {
    id,
    fileName,
    originalFileName: originalFileName || fileName,
    source,
    status,
    recordCount,
    county,
    state,
    downloadUrl,
    metadata,
    receivedAt: new Date().toISOString()
  }

  // Store in memory (server-side)
  leadListsData.unshift(newList)

  // Keep only last 100 entries
  if (leadListsData.length > 100) {
    leadListsData = leadListsData.slice(0, 100)
  }

  // Also try to store in database
  try {
    const supabase = createServerClient()
    await supabase.from('records').insert({
      name: fileName,
      county,
      state,
      status: mapStatusReverse(status),
      record_count: recordCount,
      file_url: downloadUrl,
      date_imported: new Date().toISOString(),
    })
  } catch (dbError) {
    console.warn('[Webhook] Failed to store in database:', dbError)
    // Continue with in-memory storage
  }

  console.log(`[Webhook] New list received: ${fileName}`)

  return NextResponse.json({ 
    success: true, 
    id,
    message: 'Lead list registered successfully',
    list: newList
  })
}

// PATCH: Update a lead list status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      )
    }

    // Try to update in database first
    try {
      const supabase = createServerClient()
      
      const dbUpdates: any = {}
      if (updates.status) {
        dbUpdates.status = mapStatusReverse(updates.status)
      }
      if (updates.uploadedAt) {
        dbUpdates.updated_at = updates.uploadedAt
      }

      const { error } = await supabase
        .from('records')
        .update(dbUpdates)
        .eq('id', id)

      if (!error) {
        return NextResponse.json({ success: true })
      }
    } catch (dbError) {
      console.warn('[Webhook PATCH] Database update failed:', dbError)
    }

    // Fallback: Update in-memory
    const index = leadListsData.findIndex(list => list.id === id)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Lead list not found' },
        { status: 404 }
      )
    }

    leadListsData[index] = { ...leadListsData[index], ...updates }

    return NextResponse.json({ 
      success: true, 
      list: leadListsData[index]
    })

  } catch (error) {
    console.error('[Webhook PATCH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// Map database status to UI status
function mapStatus(dbStatus: string): string {
  const statusMap: Record<string, string> = {
    'processing': 'scrubbing',
    'ready': 'ready',
    'launched': 'uploaded_to_launchcontrol',
    'error': 'error',
  }
  return statusMap[dbStatus] || 'incoming'
}

// Map UI status to database status
function mapStatusReverse(uiStatus: string): string {
  const statusMap: Record<string, string> = {
    'incoming': 'processing',
    'scrubbing': 'processing',
    'ready': 'ready',
    'uploaded_to_launchcontrol': 'launched',
    'error': 'error',
  }
  return statusMap[uiStatus] || 'processing'
}
