import { NextRequest, NextResponse } from 'next/server'

// In-memory store for server-side (since zustand is client-side)
// In production, you'd use a database
let leadListsData: any[] = []

// Load from localStorage on client reconnect
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    lists: leadListsData,
    count: leadListsData.length 
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Expected payload from N8N:
    // {
    //   fileName: string,
    //   originalFileName: string,
    //   source: 'landportal',
    //   status: 'incoming' | 'ready',
    //   recordCount?: number,
    //   county?: string,
    //   state?: string,
    //   downloadUrl?: string,
    //   metadata?: {
    //     emailSubject?: string,
    //     emailFrom?: string,
    //     lastSaleDate?: string,
    //     acreageRange?: string
    //   }
    // }
    
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

    console.log(`[LeadList Webhook] New list received: ${fileName}`)

    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Lead list registered successfully',
      list: newList
    })

  } catch (error) {
    console.error('[LeadList Webhook] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// Update a lead list status
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
    console.error('[LeadList Webhook] PATCH Error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
