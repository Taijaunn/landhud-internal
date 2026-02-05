import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Twilio webhook for receiving inbound SMS
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Twilio sends data as form-urlencoded
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string
    const status = formData.get('SmsStatus') as string

    if (!from || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Normalize phone number for lookup (remove +1 and formatting)
    const normalizedFrom = from.replace(/\D/g, '').replace(/^1/, '')
    
    // Find lead by phone number
    const { data: leads, error: leadError } = await supabase
      .from('crm_leads')
      .select('id, owner_first_name, owner_last_name')
      .or(`owner_phone.ilike.%${normalizedFrom}%,owner_phone_2.ilike.%${normalizedFrom}%`)
      .limit(1)

    if (leadError) {
      console.error('Error finding lead:', leadError)
    }

    const lead = leads?.[0]

    if (lead) {
      // Store communication record
      const { data: commData, error: commError } = await supabase
        .from('crm_communications')
        .insert([{
          lead_id: lead.id,
          type: 'sms',
          direction: 'inbound',
          from_number: from,
          to_number: to,
          body: body,
          twilio_sid: messageSid,
          twilio_status: status,
          status: 'received',
        }])
        .select()
        .single()

      if (commError) {
        console.error('Error storing communication:', commError)
      }

      // Log activity
      await supabase
        .from('crm_activities')
        .insert([{
          lead_id: lead.id,
          type: 'sms_received',
          title: `SMS received from ${lead.owner_first_name} ${lead.owner_last_name}`,
          description: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
          communication_id: commData?.id,
          performed_by: 'system',
          performed_by_name: 'System',
        }])

      // Update last_contacted_at
      await supabase
        .from('crm_leads')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', lead.id)
    } else {
      // Store as unmatched message (could create a separate table or log)
      console.log('Received SMS from unknown number:', from, body)
      
      // Optionally store in a generic communications table or log for review
    }

    // Return TwiML response (empty response means no auto-reply)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Twilio may also send GET requests for validation
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Twilio webhook endpoint' })
}
