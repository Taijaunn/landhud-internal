import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client (uses anon key)
// Only create if environment variables are available (handles build time)
let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient as SupabaseClient

// Server-side Supabase client (uses service role key for admin operations)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// Database types
export interface Record {
  id: string
  name: string
  county: string
  state: string
  date_imported: string
  record_count: number
  status: 'ready' | 'launched'
  file_url: string | null
  source_file_url: string | null
  created_at: string
  updated_at: string
}
