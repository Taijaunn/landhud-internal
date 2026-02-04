import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: record, error } = await supabase
      .from('records')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[Status] Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        name: record.name,
        county: record.county,
        state: record.state,
        status: record.status,
        record_count: record.record_count,
        file_url: record.file_url,
        source_file_url: record.source_file_url,
        error_message: record.error_message,
        created_at: record.created_at,
        updated_at: record.updated_at,
      },
    })

  } catch (error) {
    console.error('[Status] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
