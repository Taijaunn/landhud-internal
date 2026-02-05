import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

export async function POST(request: NextRequest) {
  try {
    const { leadId, toNumber, body, userId, userName } = await request.json()

    // Validate required fields
    if (!leadId || !toNumber || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: leadId, toNumber, body' },
        { status: 400 }
      )
    }

    // Check Twilio configuration
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio configuration missing')
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      )
    }

    // Format phone number (ensure it starts with +1 for US)
    let formattedNumber = toNumber.replace(/\D/g, '')
    if (formattedNumber.length === 10) {
      formattedNumber = `+1${formattedNumber}`
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = `+${formattedNumber}`
    }

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: formattedNumber,
        Body: body,
      }).toString(),
    })

    const twilioData = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData)
      return NextResponse.json(
        { success: false, error: twilioData.message || 'Failed to send SMS' },
        { status: 500 }
      )
    }

    const supabase = createServerClient()

    // Store communication record
    const { data: commData, error: commError } = await supabase
      .from('crm_communications')
      .insert([{
        lead_id: leadId,
        type: 'sms',
        direction: 'outbound',
        from_number: TWILIO_PHONE_NUMBER,
        to_number: formattedNumber,
        body: body,
        twilio_sid: twilioData.sid,
        twilio_status: twilioData.status,
        status: twilioData.status === 'queued' || twilioData.status === 'sent' ? 'sent' : 'pending',
        sent_by: userId,
        sent_by_name: userName,
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
        lead_id: leadId,
        type: 'sms_sent',
        title: 'SMS sent',
        description: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
        communication_id: commData?.id,
        performed_by: userId,
        performed_by_name: userName,
      }])

    // Update last_contacted_at on lead
    await supabase
      .from('crm_leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', leadId)

    return NextResponse.json({
      success: true,
      messageSid: twilioData.sid,
      status: twilioData.status,
    })

  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
