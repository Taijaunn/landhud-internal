-- Lead Lists Storage Setup
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Create bucket for raw uploaded lists (from LandPortal)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lead-lists',
  'lead-lists',
  true,  -- public for N8N access
  52428800,  -- 50MB limit
  ARRAY['text/csv', 'application/csv', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create bucket for processed/clean lists (output from N8N)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clean-lists',
  'clean-lists',
  true,  -- public for download access
  52428800,  -- 50MB limit
  ARRAY['text/csv', 'application/csv', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. STORAGE POLICIES - lead-lists bucket
-- =====================================================

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload to lead-lists"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lead-lists');

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read from lead-lists"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'lead-lists');

-- Allow service role full access (for API routes)
CREATE POLICY "Allow service role full access to lead-lists"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'lead-lists')
WITH CHECK (bucket_id = 'lead-lists');

-- Allow public read access (for N8N webhook)
CREATE POLICY "Allow public read from lead-lists"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'lead-lists');

-- =====================================================
-- 3. STORAGE POLICIES - clean-lists bucket
-- =====================================================

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read from clean-lists"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'clean-lists');

-- Allow service role full access
CREATE POLICY "Allow service role full access to clean-lists"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'clean-lists')
WITH CHECK (bucket_id = 'clean-lists');

-- Allow public read access (for downloads)
CREATE POLICY "Allow public read from clean-lists"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'clean-lists');

-- =====================================================
-- 4. UPDATE RECORDS TABLE (if needed)
-- =====================================================

-- Add columns if they don't exist
DO $$ 
BEGIN
  -- Add source_file_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'source_file_url'
  ) THEN
    ALTER TABLE records ADD COLUMN source_file_url TEXT;
  END IF;

  -- Add error_message column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE records ADD COLUMN error_message TEXT;
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'notes'
  ) THEN
    ALTER TABLE records ADD COLUMN notes TEXT;
  END IF;

  -- Ensure status supports 'processing' and 'error'
  -- If status is an enum, you may need to add values:
  -- ALTER TYPE record_status ADD VALUE IF NOT EXISTS 'processing';
  -- ALTER TYPE record_status ADD VALUE IF NOT EXISTS 'error';
END $$;

-- =====================================================
-- 5. INDEX FOR FASTER QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
