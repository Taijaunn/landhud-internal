import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type {
  CRMLead,
  CRMLeadWithRelations,
  CRMActivity,
  CRMCommunication,
  CRMComp,
  CRMNote,
  CRMTask,
  CRMLeadFilters,
  PipelineStage,
  PipelineSummary,
  ActivityType,
} from '@/lib/types/crm'

interface CRMState {
  // Leads
  leads: CRMLead[]
  currentLead: CRMLeadWithRelations | null
  leadsLoading: boolean
  leadsError: string | null
  
  // Filters
  filters: CRMLeadFilters
  sortBy: { field: keyof CRMLead; direction: 'asc' | 'desc' }
  
  // Pipeline
  pipelineSummary: PipelineSummary[]
  
  // Actions - Leads
  fetchLeads: (filters?: CRMLeadFilters) => Promise<void>
  fetchLead: (id: string) => Promise<void>
  createLead: (lead: Partial<CRMLead>) => Promise<CRMLead | null>
  updateLead: (id: string, updates: Partial<CRMLead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  updateLeadStage: (id: string, stage: PipelineStage, userId: string, userName: string) => Promise<void>
  
  // Actions - Activities
  fetchActivities: (leadId: string) => Promise<CRMActivity[]>
  addActivity: (activity: Omit<CRMActivity, 'id' | 'created_at'>) => Promise<void>
  
  // Actions - Communications
  fetchCommunications: (leadId: string) => Promise<CRMCommunication[]>
  sendSMS: (leadId: string, toNumber: string, body: string, userId: string, userName: string) => Promise<void>
  logCall: (leadId: string, data: Partial<CRMCommunication>, userId: string, userName: string) => Promise<void>
  
  // Actions - Comps
  fetchComps: (leadId: string) => Promise<CRMComp[]>
  addComp: (comp: Omit<CRMComp, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateComp: (id: string, updates: Partial<CRMComp>) => Promise<void>
  
  // Actions - Notes
  fetchNotes: (leadId: string) => Promise<CRMNote[]>
  addNote: (leadId: string, content: string, userId: string, userName: string) => Promise<void>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  toggleNotePin: (id: string, isPinned: boolean) => Promise<void>
  
  // Actions - Tasks
  fetchTasks: (leadId?: string) => Promise<CRMTask[]>
  createTask: (task: Omit<CRMTask, 'id' | 'created_at' | 'is_completed' | 'completed_at'>) => Promise<void>
  completeTask: (id: string) => Promise<void>
  
  // Actions - Pipeline
  fetchPipelineSummary: () => Promise<void>
  
  // Actions - Filters
  setFilters: (filters: CRMLeadFilters) => void
  setSortBy: (field: keyof CRMLead, direction: 'asc' | 'desc') => void
  clearFilters: () => void
}

export const useCRMStore = create<CRMState>((set, get) => ({
  // Initial state
  leads: [],
  currentLead: null,
  leadsLoading: false,
  leadsError: null,
  filters: {},
  sortBy: { field: 'created_at', direction: 'desc' },
  pipelineSummary: [],

  // Fetch all leads with optional filters
  fetchLeads: async (filters?: CRMLeadFilters) => {
    set({ leadsLoading: true, leadsError: null })
    try {
      let query = supabase
        .from('crm_leads')
        .select('*')
      
      const appliedFilters = filters || get().filters
      
      // Apply filters
      if (appliedFilters.stage?.length) {
        query = query.in('stage', appliedFilters.stage)
      }
      if (appliedFilters.source?.length) {
        query = query.in('source', appliedFilters.source)
      }
      if (appliedFilters.assigned_to?.length) {
        query = query.in('assigned_to', appliedFilters.assigned_to)
      }
      if (appliedFilters.is_hot !== undefined) {
        query = query.eq('is_hot', appliedFilters.is_hot)
      }
      if (appliedFilters.is_starred !== undefined) {
        query = query.eq('is_starred', appliedFilters.is_starred)
      }
      if (appliedFilters.state?.length) {
        query = query.in('property_state', appliedFilters.state)
      }
      if (appliedFilters.county?.length) {
        query = query.in('property_county', appliedFilters.county)
      }
      if (appliedFilters.min_acreage) {
        query = query.gte('acreage', appliedFilters.min_acreage)
      }
      if (appliedFilters.max_acreage) {
        query = query.lte('acreage', appliedFilters.max_acreage)
      }
      if (appliedFilters.search) {
        query = query.or(`owner_first_name.ilike.%${appliedFilters.search}%,owner_last_name.ilike.%${appliedFilters.search}%,owner_phone.ilike.%${appliedFilters.search}%,property_address.ilike.%${appliedFilters.search}%,apn.ilike.%${appliedFilters.search}%`)
      }
      
      // Apply sorting
      const { field, direction } = get().sortBy
      query = query.order(field, { ascending: direction === 'asc' })
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ leads: data || [], leadsLoading: false })
    } catch (error) {
      set({ leadsError: (error as Error).message, leadsLoading: false })
    }
  },

  // Fetch single lead with all relations
  fetchLead: async (id: string) => {
    set({ leadsLoading: true, leadsError: null })
    try {
      const { data: lead, error: leadError } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', id)
        .single()
      
      if (leadError) throw leadError
      
      // Fetch related data in parallel
      const [activities, communications, comps, notes, tasks] = await Promise.all([
        get().fetchActivities(id),
        get().fetchCommunications(id),
        get().fetchComps(id),
        get().fetchNotes(id),
        get().fetchTasks(id),
      ])
      
      // Calculate average comp value
      const avgCompValue = comps.length > 0
        ? comps.reduce((sum, c) => sum + c.comp_value, 0) / comps.length
        : undefined
      
      set({
        currentLead: {
          ...lead,
          activities,
          communications,
          comps,
          notes,
          tasks,
          average_comp_value: avgCompValue,
        },
        leadsLoading: false,
      })
    } catch (error) {
      set({ leadsError: (error as Error).message, leadsLoading: false })
    }
  },

  // Create new lead
  createLead: async (lead: Partial<CRMLead>) => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert([lead])
        .select()
        .single()
      
      if (error) throw error
      
      // Add activity
      await get().addActivity({
        lead_id: data.id,
        type: 'lead_created',
        title: 'Lead created',
        performed_by: lead.created_by!,
        performed_by_name: lead.created_by!, // Should be actual name
      })
      
      // Refresh leads list
      await get().fetchLeads()
      
      return data
    } catch (error) {
      console.error('Error creating lead:', error)
      return null
    }
  },

  // Update lead
  updateLead: async (id: string, updates: Partial<CRMLead>) => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh if current lead
      if (get().currentLead?.id === id) {
        await get().fetchLead(id)
      }
      
      // Refresh leads list
      await get().fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  },

  // Delete lead
  deleteLead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set({ currentLead: null })
      await get().fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  },

  // Update lead stage with activity logging
  updateLeadStage: async (id: string, stage: PipelineStage, userId: string, userName: string) => {
    const currentLead = get().leads.find(l => l.id === id) || get().currentLead
    const oldStage = currentLead?.stage
    
    try {
      const { error } = await supabase
        .from('crm_leads')
        .update({ stage })
        .eq('id', id)
      
      if (error) throw error
      
      // Log activity
      await get().addActivity({
        lead_id: id,
        type: 'stage_changed',
        title: `Stage changed to ${stage}`,
        old_value: oldStage,
        new_value: stage,
        performed_by: userId,
        performed_by_name: userName,
      })
      
      // Refresh data
      if (get().currentLead?.id === id) {
        await get().fetchLead(id)
      }
      await get().fetchLeads()
      await get().fetchPipelineSummary()
    } catch (error) {
      console.error('Error updating lead stage:', error)
    }
  },

  // Fetch activities for a lead
  fetchActivities: async (leadId: string) => {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }
    
    return data || []
  },

  // Add activity
  addActivity: async (activity: Omit<CRMActivity, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('crm_activities')
      .insert([activity])
    
    if (error) {
      console.error('Error adding activity:', error)
    }
  },

  // Fetch communications
  fetchCommunications: async (leadId: string) => {
    const { data, error } = await supabase
      .from('crm_communications')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching communications:', error)
      return []
    }
    
    return data || []
  },

  // Send SMS via API (Twilio)
  sendSMS: async (leadId: string, toNumber: string, body: string, userId: string, userName: string) => {
    try {
      const response = await fetch('/api/crm/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, toNumber, body, userId, userName }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send SMS')
      }
      
      // Refresh lead data
      if (get().currentLead?.id === leadId) {
        await get().fetchLead(leadId)
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      throw error
    }
  },

  // Log a call
  logCall: async (leadId: string, data: Partial<CRMCommunication>, userId: string, userName: string) => {
    try {
      const { error: commError } = await supabase
        .from('crm_communications')
        .insert([{
          lead_id: leadId,
          type: 'call',
          direction: data.direction || 'outbound',
          body: data.body || '',
          call_duration_seconds: data.call_duration_seconds,
          call_outcome: data.call_outcome,
          status: 'delivered',
          sent_by: userId,
          sent_by_name: userName,
        }])
      
      if (commError) throw commError
      
      // Add activity
      await get().addActivity({
        lead_id: leadId,
        type: 'call_logged',
        title: `Call logged: ${data.call_outcome || 'No outcome'}`,
        description: data.body,
        performed_by: userId,
        performed_by_name: userName,
      })
      
      // Update last contacted
      await supabase
        .from('crm_leads')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', leadId)
      
      // Refresh lead data
      if (get().currentLead?.id === leadId) {
        await get().fetchLead(leadId)
      }
    } catch (error) {
      console.error('Error logging call:', error)
      throw error
    }
  },

  // Fetch comps
  fetchComps: async (leadId: string) => {
    const { data, error } = await supabase
      .from('crm_comps')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching comps:', error)
      return []
    }
    
    return data || []
  },

  // Add comp
  addComp: async (comp: Omit<CRMComp, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('crm_comps')
        .insert([comp])
        .select()
        .single()
      
      if (error) throw error
      
      // Add activity
      await get().addActivity({
        lead_id: comp.lead_id,
        type: 'comp_added',
        title: `Comp added: $${comp.comp_value.toLocaleString()}`,
        description: `by ${comp.comper_name}`,
        comp_id: data.id,
        performed_by: comp.comper_id,
        performed_by_name: comp.comper_name,
      })
      
      // Refresh lead data
      if (get().currentLead?.id === comp.lead_id) {
        await get().fetchLead(comp.lead_id)
      }
    } catch (error) {
      console.error('Error adding comp:', error)
      throw error
    }
  },

  // Update comp
  updateComp: async (id: string, updates: Partial<CRMComp>) => {
    try {
      const { error } = await supabase
        .from('crm_comps')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error updating comp:', error)
    }
  },

  // Fetch notes
  fetchNotes: async (leadId: string) => {
    const { data, error } = await supabase
      .from('crm_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    
    return data || []
  },

  // Add note
  addNote: async (leadId: string, content: string, userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('crm_notes')
        .insert([{
          lead_id: leadId,
          content,
          created_by: userId,
          created_by_name: userName,
        }])
      
      if (error) throw error
      
      // Add activity
      await get().addActivity({
        lead_id: leadId,
        type: 'note_added',
        title: 'Note added',
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        performed_by: userId,
        performed_by_name: userName,
      })
      
      // Refresh lead data
      if (get().currentLead?.id === leadId) {
        await get().fetchLead(leadId)
      }
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  },

  // Update note
  updateNote: async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('crm_notes')
        .update({ content })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error updating note:', error)
    }
  },

  // Delete note
  deleteNote: async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  },

  // Toggle note pin
  toggleNotePin: async (id: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('crm_notes')
        .update({ is_pinned: isPinned })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error toggling note pin:', error)
    }
  },

  // Fetch tasks
  fetchTasks: async (leadId?: string) => {
    let query = supabase
      .from('crm_tasks')
      .select('*')
      .order('due_date', { ascending: true })
    
    if (leadId) {
      query = query.eq('lead_id', leadId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
    
    return data || []
  },

  // Create task
  createTask: async (task: Omit<CRMTask, 'id' | 'created_at' | 'is_completed' | 'completed_at'>) => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .insert([task])
      
      if (error) throw error
      
      // Add activity if linked to a lead
      if (task.lead_id) {
        await get().addActivity({
          lead_id: task.lead_id,
          type: 'task_created',
          title: `Task created: ${task.title}`,
          performed_by: task.created_by,
          performed_by_name: task.created_by, // Should be actual name
        })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  // Complete task
  completeTask: async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error completing task:', error)
    }
  },

  // Fetch pipeline summary
  fetchPipelineSummary: async () => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('stage, offer_price')
      
      if (error) throw error
      
      // Aggregate by stage
      const summary: Record<string, PipelineSummary> = {}
      
      data?.forEach(lead => {
        if (!summary[lead.stage]) {
          summary[lead.stage] = {
            stage: lead.stage as PipelineStage,
            count: 0,
            total_value: 0,
          }
        }
        summary[lead.stage].count++
        if (lead.offer_price) {
          summary[lead.stage].total_value += lead.offer_price
        }
      })
      
      set({ pipelineSummary: Object.values(summary) })
    } catch (error) {
      console.error('Error fetching pipeline summary:', error)
    }
  },

  // Set filters
  setFilters: (filters: CRMLeadFilters) => {
    set({ filters })
  },

  // Set sort
  setSortBy: (field: keyof CRMLead, direction: 'asc' | 'desc') => {
    set({ sortBy: { field, direction } })
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} })
  },
}))
