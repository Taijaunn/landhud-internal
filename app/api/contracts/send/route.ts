import { NextRequest, NextResponse } from 'next/server'

interface ContractRequest {
  // Seller Info
  sellerName: string
  sellerEmail: string
  hasSeller2: boolean
  seller2Name: string
  seller2Email: string
  // Property Info
  propertyAddress: string
  parcelId: string
  parcelCounty: string
  legalDescription: string
  // Deal Terms
  purchasePrice: string
  depositAmount: string
  depositDays: string
  isRefundable: string
  dueDiligence: string
  closingDate: string
  additionalTerms: string
}

// Sender/Buyer info (LandHud)
const SENDER_INFO = {
  email: 'admin@landhud.com',
  firstName: 'LandHud',
  lastName: 'LLC',
  company: 'LandHud LLC'
}

export async function POST(request: NextRequest) {
  try {
    const body: ContractRequest = await request.json()

    // Validate required fields
    const requiredFields = [
      'sellerName', 'sellerEmail', 'propertyAddress', 'parcelId',
      'parcelCounty', 'legalDescription', 'purchasePrice', 'depositAmount',
      'depositDays', 'isRefundable', 'dueDiligence', 'closingDate'
    ]

    for (const field of requiredFields) {
      if (!body[field as keyof ContractRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate Seller 2 fields if enabled
    if (body.hasSeller2) {
      if (!body.seller2Name || !body.seller2Email) {
        return NextResponse.json(
          { error: 'Seller 2 name and email are required when adding a second seller' },
          { status: 400 }
        )
      }
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.sellerEmail)) {
      return NextResponse.json(
        { error: 'Invalid seller email address' },
        { status: 400 }
      )
    }
    if (body.hasSeller2 && body.seller2Email && !emailRegex.test(body.seller2Email)) {
      return NextResponse.json(
        { error: 'Invalid seller 2 email address' },
        { status: 400 }
      )
    }

    const apiKey = process.env.PANDADOC_API_KEY
    const templateId = process.env.PANDADOC_TEMPLATE_ID

    if (!apiKey) {
      return NextResponse.json(
        { error: 'PandaDoc API key not configured' },
        { status: 500 }
      )
    }

    if (!templateId) {
      return NextResponse.json(
        { error: 'PandaDoc template ID not configured' },
        { status: 500 }
      )
    }

    // Format closing date for display
    const closingDateFormatted = new Date(body.closingDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Build recipients array
    const recipients = [
      {
        email: SENDER_INFO.email,
        first_name: SENDER_INFO.firstName,
        last_name: SENDER_INFO.lastName,
        role: 'Buyer'
      },
      {
        email: body.sellerEmail,
        first_name: body.sellerName.split(' ')[0] || body.sellerName,
        last_name: body.sellerName.split(' ').slice(1).join(' ') || '',
        role: 'Seller'
      }
    ]

    // Add Seller 2 if enabled
    if (body.hasSeller2 && body.seller2Name && body.seller2Email) {
      recipients.push({
        email: body.seller2Email,
        first_name: body.seller2Name.split(' ')[0] || body.seller2Name,
        last_name: body.seller2Name.split(' ').slice(1).join(' ') || '',
        role: 'Seller 2'
      })
    }

    // Build tokens array with all merge field values
    // Token names should match the merge field names in your PandaDoc template
    const tokens = [
      // Sender/Buyer tokens
      { name: 'Sender.FirstName', value: SENDER_INFO.firstName },
      { name: 'Sender.LastName', value: SENDER_INFO.lastName },
      { name: 'Sender.Company', value: SENDER_INFO.company },
      { name: 'Buyer_Name', value: `${SENDER_INFO.firstName} ${SENDER_INFO.lastName}` },

      // Client/Seller tokens
      { name: 'Client.FirstName', value: body.sellerName.split(' ')[0] || body.sellerName },
      { name: 'Client.LastName', value: body.sellerName.split(' ').slice(1).join(' ') || '' },
      { name: 'Client.Company', value: '' },
      { name: 'Seller_Name', value: body.sellerName },
      { name: 'Seller_Name2', value: body.sellerName },

      // Property tokens
      { name: 'Property_Address', value: body.propertyAddress },
      { name: 'Parcel_ID', value: body.parcelId },
      { name: 'Parcel_County', value: body.parcelCounty },
      { name: 'Legal_Desc', value: body.legalDescription },

      // Deal terms tokens
      { name: 'Purchase_Price', value: body.purchasePrice },
      { name: 'Deposit_Amount', value: body.depositAmount },
      { name: 'Deposit_Days', value: body.depositDays },
      { name: 'Is_Or_IsNot_Refundable', value: body.isRefundable },
      { name: 'Due_Dilligence', value: body.dueDiligence },
      { name: 'Closing_Date', value: closingDateFormatted },
      { name: 'Addtl_Terms', value: body.additionalTerms || 'N/A' },

      // Seller 2 token
      { name: 'Seller2name', value: body.hasSeller2 ? body.seller2Name : '' }
    ]

    // Create document from template with tokens
    const createDocPayload = {
      name: `PSA - ${body.propertyAddress} - ${body.sellerName}`,
      template_uuid: templateId,
      recipients,
      tokens,
      metadata: {
        property_address: body.propertyAddress,
        parcel_id: body.parcelId,
        seller_name: body.sellerName,
        purchase_price: body.purchasePrice
      }
    }

    console.log('Step 1: Creating PandaDoc document with tokens...')
    console.log('Tokens being sent:', JSON.stringify(tokens, null, 2))

    const createDocResponse = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createDocPayload)
    })

    const responseText = await createDocResponse.text()
    console.log('Create document response:', responseText)

    if (!createDocResponse.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { detail: responseText }
      }
      console.error('PandaDoc create document error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create document in PandaDoc' },
        { status: 500 }
      )
    }

    const createDocData = JSON.parse(responseText)
    const documentId = createDocData.id

    console.log('Document created with ID:', documentId)

    // Step 2: Wait for document to be ready
    let documentStatus = 'document.uploaded'
    let attempts = 0
    const maxAttempts = 30

    while (documentStatus !== 'document.draft' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusResponse = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}`, {
        headers: {
          'Authorization': `API-Key ${apiKey}`
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        documentStatus = statusData.status
        console.log(`Status check ${attempts + 1}: ${documentStatus}`)
      }
      attempts++
    }

    if (documentStatus !== 'document.draft') {
      console.error('Document processing timed out. Final status:', documentStatus)
      return NextResponse.json(
        { error: 'Document processing timed out. Please try again.' },
        { status: 500 }
      )
    }

    // Step 3: Send document for signature
    console.log('Step 3: Sending document for signature...')

    const sendPayload = {
      message: `Please review and sign the Purchase & Sale Agreement for the property at ${body.propertyAddress}.`,
      subject: `Purchase & Sale Agreement - ${body.propertyAddress}`,
      silent: false
    }

    const sendResponse = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendPayload)
    })

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json().catch(() => ({}))
      console.error('PandaDoc send document error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || errorData.info_message || 'Failed to send document for signature' },
        { status: 500 }
      )
    }

    const sendData = await sendResponse.json()

    console.log('Document sent successfully!')

    return NextResponse.json({
      success: true,
      documentId: documentId,
      status: sendData.status,
      message: 'Contract sent successfully'
    })

  } catch (error) {
    console.error('Contract send error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
