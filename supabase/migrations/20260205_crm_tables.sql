-- CRM Tables for LandHud Internal
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pipeline Stages (configurable)
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_actions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default pipeline stages
INSERT INTO crm_pipeline_stages (name, slug, color, "order") VALUES
  ('New', 'new', '#3b82f6', 1),
  ('Contacted', 'contacted', '#06b6d4', 2),
  ('Qualified', 'qualified', '#6366f1', 3),
  ('Negotiating', 'negotiating', '#eab308', 4),
  ('Offer Sent', 'offer_sent', '#f97316', 5),
  ('Under Contract', 'under_contract', '#a855f7', 6),
  ('Closed Won', 'closed_won', '#22c55e', 7),
  ('Closed Lost', 'closed_lost', '#ef4444', 8),
  ('Dead', 'dead', '#6b7280', 9)
ON CONFLICT (slug) DO NOTHING;

-- CRM Leads (main table)
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Owner Information
  owner_first_name TEXT NOT NULL,
  owner_last_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_phone_2 TEXT,
  owner_email TEXT,
  
  -- Mailing Address
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  
  -- Property Information
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT NOT NULL,
  property_county TEXT NOT NULL,
  property_zip TEXT,
  apn TEXT NOT NULL,
  
  -- Property Details
  acreage DECIMAL(10,2) NOT NULL,
  lot_sqft INTEGER,
  zoning TEXT,
  land_use TEXT,
  legal_description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Financial
  asking_price DECIMAL(12,2),
  offer_price DECIMAL(12,2),
  market_value DECIMAL(12,2),
  tax_assessed_value DECIMAL(12,2),
  annual_taxes DECIMAL(10,2),
  
  -- Pipeline
  stage TEXT NOT NULL DEFAULT 'new' REFERENCES crm_pipeline_stages(slug),
  source TEXT NOT NULL DEFAULT 'cold_sms',
  assigned_to TEXT,
  
  -- Status Flags
  is_hot BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  do_not_contact BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  tags TEXT[],
  custom_fields JSONB,
  notes_count INTEGER NOT NULL DEFAULT 0,
  activities_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Creator
  created_by TEXT NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_leads_property_state ON crm_leads(property_state);
CREATE INDEX IF NOT EXISTS idx_crm_leads_property_county ON crm_leads(property_county);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_is_hot ON crm_leads(is_hot) WHERE is_hot = true;
CREATE INDEX IF NOT EXISTS idx_crm_leads_is_starred ON crm_leads(is_starred) WHERE is_starred = true;

-- Full text search on leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_search ON crm_leads USING gin(
  to_tsvector('english', 
    COALESCE(owner_first_name, '') || ' ' || 
    COALESCE(owner_last_name, '') || ' ' || 
    COALESCE(owner_phone, '') || ' ' ||
    COALESCE(property_address, '') || ' ' ||
    COALESCE(property_city, '') || ' ' ||
    COALESCE(property_county, '') || ' ' ||
    COALESCE(apn, '')
  )
);

-- CRM Activities (timeline)
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- For stage changes
  old_value TEXT,
  new_value TEXT,
  
  -- References
  communication_id UUID,
  comp_id UUID,
  
  -- Metadata
  metadata JSONB,
  
  -- User who performed action
  performed_by TEXT NOT NULL,
  performed_by_name TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_at ON crm_activities(created_at DESC);

-- CRM Communications (SMS, Email, Calls)
CREATE TABLE IF NOT EXISTS crm_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'sms', 'email', 'call'
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  
  -- Contact info
  from_number TEXT,
  to_number TEXT,
  from_email TEXT,
  to_email TEXT,
  
  -- Content
  subject TEXT,
  body TEXT NOT NULL,
  
  -- Call specific
  call_duration_seconds INTEGER,
  call_recording_url TEXT,
  call_outcome TEXT,
  
  -- SMS specific (Twilio)
  twilio_sid TEXT,
  twilio_status TEXT,
  
  -- Email specific
  email_message_id TEXT,
  email_thread_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- User
  sent_by TEXT,
  sent_by_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_communications_lead_id ON crm_communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_communications_type ON crm_communications(type);
CREATE INDEX IF NOT EXISTS idx_crm_communications_twilio_sid ON crm_communications(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_crm_communications_created_at ON crm_communications(created_at DESC);

-- CRM Comps (Property Valuations)
CREATE TABLE IF NOT EXISTS crm_comps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  
  -- Comper info
  comper_id TEXT NOT NULL,
  comper_name TEXT NOT NULL,
  
  -- Valuation
  comp_value DECIMAL(12,2) NOT NULL,
  confidence_level TEXT, -- 'low', 'medium', 'high'
  
  -- Methodology
  methodology TEXT,
  comparable_sales JSONB,
  
  -- Notes
  notes TEXT,
  
  -- Attachments
  attachments TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_comps_lead_id ON crm_comps(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_comps_comper_id ON crm_comps(comper_id);

-- CRM Notes
CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_lead_id ON crm_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_is_pinned ON crm_notes(is_pinned) WHERE is_pinned = true;

-- CRM Tasks
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  assigned_to TEXT,
  assigned_to_name TEXT,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead_id ON crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_is_completed ON crm_tasks(is_completed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_comps_updated_at ON crm_comps;
CREATE TRIGGER update_crm_comps_updated_at
  BEFORE UPDATE ON crm_comps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_notes_updated_at ON crm_notes;
CREATE TRIGGER update_crm_notes_updated_at
  BEFORE UPDATE ON crm_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment activity count
CREATE OR REPLACE FUNCTION increment_lead_activity_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE crm_leads 
  SET activities_count = activities_count + 1
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS increment_activity_count ON crm_activities;
CREATE TRIGGER increment_activity_count
  AFTER INSERT ON crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION increment_lead_activity_count();

-- Function to increment notes count
CREATE OR REPLACE FUNCTION increment_lead_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE crm_leads 
  SET notes_count = notes_count + 1
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS increment_notes_count ON crm_notes;
CREATE TRIGGER increment_notes_count
  AFTER INSERT ON crm_notes
  FOR EACH ROW
  EXECUTE FUNCTION increment_lead_notes_count();

-- RLS Policies (enable row level security)
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated" ON crm_leads FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_activities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_communications FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_comps FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_notes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON crm_pipeline_stages FOR ALL USING (true);

-- View for lead with aggregated comp data
CREATE OR REPLACE VIEW crm_leads_with_comps AS
SELECT 
  l.*,
  COALESCE(c.comp_count, 0) as comp_count,
  c.avg_comp_value,
  c.min_comp_value,
  c.max_comp_value
FROM crm_leads l
LEFT JOIN (
  SELECT 
    lead_id,
    COUNT(*) as comp_count,
    AVG(comp_value) as avg_comp_value,
    MIN(comp_value) as min_comp_value,
    MAX(comp_value) as max_comp_value
  FROM crm_comps
  GROUP BY lead_id
) c ON l.id = c.lead_id;
