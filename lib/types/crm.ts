// CRM Types for LandHud Internal

export type PipelineStage = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'negotiating'
  | 'offer_sent'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'
  | 'dead'

export type ActivityType =
  | 'lead_created'
  | 'note_added'
  | 'sms_sent'
  | 'sms_received'
  | 'call_logged'
  | 'call_scheduled'
  | 'email_sent'
  | 'email_received'
  | 'stage_changed'
  | 'comp_added'
  | 'comp_updated'
  | 'offer_made'
  | 'document_added'
  | 'task_created'
  | 'task_completed'

export type LeadSource =
  | 'cold_sms'
  | 'cold_call'
  | 'inbound_call'
  | 'website'
  | 'referral'
  | 'direct_mail'
  | 'facebook_ads'
  | 'other'

export type CommunicationType = 'sms' | 'email' | 'call'
export type CommunicationDirection = 'inbound' | 'outbound'

export interface CRMLead {
  id: string
  
  // Owner Information
  owner_first_name: string
  owner_last_name: string
  owner_phone: string
  owner_phone_2?: string
  owner_email?: string
  
  // Mailing Address
  mailing_address?: string
  mailing_city?: string
  mailing_state?: string
  mailing_zip?: string
  
  // Property Information
  property_address: string
  property_city: string
  property_state: string
  property_county: string
  property_zip?: string
  apn: string // Assessor Parcel Number
  
  // Property Details
  acreage: number
  lot_sqft?: number
  zoning?: string
  land_use?: string
  legal_description?: string
  latitude?: number
  longitude?: number
  
  // Financial
  asking_price?: number
  offer_price?: number
  market_value?: number
  tax_assessed_value?: number
  annual_taxes?: number
  
  // Pipeline
  stage: PipelineStage
  source: LeadSource
  assigned_to?: string
  
  // Status Flags
  is_hot: boolean
  is_starred: boolean
  do_not_contact: boolean
  
  // Metadata
  tags?: string[]
  custom_fields?: Record<string, unknown>
  notes_count: number
  activities_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
  last_contacted_at?: string
  next_follow_up_at?: string
  closed_at?: string
  
  // Creator
  created_by: string
}

export interface CRMActivity {
  id: string
  lead_id: string
  
  type: ActivityType
  title: string
  description?: string
  
  // For stage changes
  old_value?: string
  new_value?: string
  
  // For communications
  communication_id?: string
  
  // For comps
  comp_id?: string
  
  // Metadata
  metadata?: Record<string, unknown>
  
  // User who performed action
  performed_by: string
  performed_by_name: string
  
  // Timestamps
  created_at: string
}

export interface CRMCommunication {
  id: string
  lead_id: string
  
  type: CommunicationType
  direction: CommunicationDirection
  
  // Contact info
  from_number?: string
  to_number?: string
  from_email?: string
  to_email?: string
  
  // Content
  subject?: string
  body: string
  
  // Call specific
  call_duration_seconds?: number
  call_recording_url?: string
  call_outcome?: string
  
  // SMS specific (Twilio)
  twilio_sid?: string
  twilio_status?: string
  
  // Email specific
  email_message_id?: string
  email_thread_id?: string
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'received'
  error_message?: string
  
  // User
  sent_by?: string
  sent_by_name?: string
  
  // Timestamps
  created_at: string
  delivered_at?: string
  read_at?: string
}

export interface CRMComp {
  id: string
  lead_id: string
  
  // Comper info
  comper_id: string
  comper_name: string
  
  // Valuation
  comp_value: number
  confidence_level?: 'low' | 'medium' | 'high'
  
  // Methodology
  methodology?: string
  comparable_sales?: ComparableSale[]
  
  // Notes
  notes?: string
  
  // Attachments
  attachments?: string[]
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ComparableSale {
  address: string
  sale_price: number
  sale_date: string
  acreage: number
  price_per_acre: number
  distance_miles?: number
}

export interface CRMPipelineStage {
  id: string
  name: string
  slug: PipelineStage
  color: string
  order: number
  is_active: boolean
  auto_actions?: PipelineAutoAction[]
  created_at: string
}

export interface PipelineAutoAction {
  type: 'send_sms' | 'send_email' | 'create_task' | 'notify_user'
  config: Record<string, unknown>
}

export interface CRMNote {
  id: string
  lead_id: string
  content: string
  is_pinned: boolean
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface CRMTask {
  id: string
  lead_id?: string
  title: string
  description?: string
  due_date?: string
  is_completed: boolean
  completed_at?: string
  assigned_to?: string
  assigned_to_name?: string
  created_by: string
  created_at: string
}

// API Response types
export interface CRMLeadWithRelations extends CRMLead {
  activities?: CRMActivity[]
  communications?: CRMCommunication[]
  comps?: CRMComp[]
  notes?: CRMNote[]
  tasks?: CRMTask[]
  average_comp_value?: number
}

// Pipeline summary for dashboard
export interface PipelineSummary {
  stage: PipelineStage
  count: number
  total_value: number
}

// Filter/Search types
export interface CRMLeadFilters {
  search?: string
  stage?: PipelineStage[]
  source?: LeadSource[]
  assigned_to?: string[]
  is_hot?: boolean
  is_starred?: boolean
  state?: string[]
  county?: string[]
  min_acreage?: number
  max_acreage?: number
  min_price?: number
  max_price?: number
  tags?: string[]
  date_from?: string
  date_to?: string
}

export interface CRMSortOption {
  field: keyof CRMLead
  direction: 'asc' | 'desc'
}

// Stage configuration for UI
export const PIPELINE_STAGES: Record<PipelineStage, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  contacted: { label: 'Contacted', color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
  qualified: { label: 'Qualified', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
  negotiating: { label: 'Negotiating', color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  offer_sent: { label: 'Offer Sent', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  under_contract: { label: 'Under Contract', color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  closed_won: { label: 'Closed Won', color: 'text-green-600', bgColor: 'bg-green-500/10' },
  closed_lost: { label: 'Closed Lost', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  dead: { label: 'Dead', color: 'text-gray-600', bgColor: 'bg-gray-500/10' },
}

export const LEAD_SOURCES: Record<LeadSource, { label: string; icon?: string }> = {
  cold_sms: { label: 'Cold SMS' },
  cold_call: { label: 'Cold Call' },
  inbound_call: { label: 'Inbound Call' },
  website: { label: 'Website' },
  referral: { label: 'Referral' },
  direct_mail: { label: 'Direct Mail' },
  facebook_ads: { label: 'Facebook Ads' },
  other: { label: 'Other' },
}

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  lead_created: 'UserPlus',
  note_added: 'StickyNote',
  sms_sent: 'MessageSquare',
  sms_received: 'MessageSquareMore',
  call_logged: 'Phone',
  call_scheduled: 'PhoneCall',
  email_sent: 'Mail',
  email_received: 'MailOpen',
  stage_changed: 'ArrowRight',
  comp_added: 'Calculator',
  comp_updated: 'Calculator',
  offer_made: 'DollarSign',
  document_added: 'FileText',
  task_created: 'CheckSquare',
  task_completed: 'CheckCircle',
}
