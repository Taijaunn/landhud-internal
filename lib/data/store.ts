'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lead, Valuation, EODReportSMS, EODReportUnderwriter, TrainingChapter, UserRole } from '@/lib/types'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Current user state (mock auth)
interface UserState {
  currentRole: UserRole
  currentUserId: string
  currentUserName: string
  setRole: (role: UserRole) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentRole: 'admin',
      currentUserId: 'admin-1',
      currentUserName: 'Taijaun',
      setRole: (role) => {
        const names: Record<UserRole, { id: string; name: string }> = {
          admin: { id: 'admin-1', name: 'Taijaun' },
          sms_va: { id: 'sms-va-1', name: 'SMS Team Member' },
          underwriter: { id: 'uw-1', name: 'Underwriter 1' }
        }
        set({ 
          currentRole: role, 
          currentUserId: names[role].id,
          currentUserName: names[role].name
        })
      }
    }),
    { name: 'landhud-user' }
  )
)

// Leads store
interface LeadsState {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'submittedAt' | 'status' | 'valuations'>) => string
  addValuation: (leadId: string, valuation: Omit<Valuation, 'id' | 'submittedAt'>) => void
  updateLeadStatus: (leadId: string, status: Lead['status']) => void
  setCalComLink: (leadId: string, link: string) => void
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: [],
      
      addLead: (leadData) => {
        const id = generateId()
        const newLead: Lead = {
          ...leadData,
          id,
          submittedAt: new Date().toISOString(),
          status: 'pending_valuation',
          valuations: []
        }
        set((state) => ({ leads: [...state.leads, newLead] }))
        return id
      },
      
      addValuation: (leadId, valuationData) => {
        const id = generateId()
        const valuation: Valuation = {
          ...valuationData,
          id,
          leadId,
          submittedAt: new Date().toISOString()
        }
        
        set((state) => ({
          leads: state.leads.map((lead) => {
            if (lead.id !== leadId) return lead
            
            const newValuations = [...lead.valuations, valuation]
            const avgValuation = newValuations.reduce((sum, v) => sum + v.valuationAmount, 0) / newValuations.length
            
            let newStatus: Lead['status'] = lead.status
            if (newValuations.length === 1) newStatus = 'one_valuation'
            if (newValuations.length >= 2) newStatus = 'valued'
            
            return {
              ...lead,
              valuations: newValuations,
              averageValuation: Math.round(avgValuation),
              status: newStatus
            }
          })
        }))
      },
      
      updateLeadStatus: (leadId, status) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, status } : lead
          )
        }))
      },
      
      setCalComLink: (leadId, link) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, calComLink: link, status: 'call_booked' } : lead
          )
        }))
      }
    }),
    { name: 'landhud-leads' }
  )
)

// EOD Reports store
interface EODState {
  smsReports: EODReportSMS[]
  underwriterReports: EODReportUnderwriter[]
  addSMSReport: (report: Omit<EODReportSMS, 'id' | 'submittedAt' | 'responseRate'>) => void
  addUnderwriterReport: (report: Omit<EODReportUnderwriter, 'id' | 'submittedAt'>) => void
}

export const useEODStore = create<EODState>()(
  persist(
    (set) => ({
      smsReports: [],
      underwriterReports: [],
      
      addSMSReport: (reportData) => {
        const report: EODReportSMS = {
          ...reportData,
          id: generateId(),
          submittedAt: new Date().toISOString(),
          responseRate: reportData.textsSent > 0 
            ? Math.round((reportData.textsReceived / reportData.textsSent) * 100 * 10) / 10 
            : 0
        }
        set((state) => ({ smsReports: [...state.smsReports, report] }))
      },
      
      addUnderwriterReport: (reportData) => {
        const report: EODReportUnderwriter = {
          ...reportData,
          id: generateId(),
          submittedAt: new Date().toISOString()
        }
        set((state) => ({ underwriterReports: [...state.underwriterReports, report] }))
      }
    }),
    { name: 'landhud-eod' }
  )
)

// Training store
interface TrainingState {
  chapters: TrainingChapter[]
  addChapter: (chapter: Omit<TrainingChapter, 'id' | 'sections' | 'order'>) => string
  updateChapter: (id: string, updates: Partial<TrainingChapter>) => void
  deleteChapter: (id: string) => void
  addSection: (chapterId: string, section: Omit<TrainingChapter['sections'][0], 'id' | 'chapterId' | 'order'>) => void
  updateSection: (chapterId: string, sectionId: string, updates: Partial<TrainingChapter['sections'][0]>) => void
  deleteSection: (chapterId: string, sectionId: string) => void
  reorderChapters: (chapters: TrainingChapter[]) => void
}

const defaultChapters: TrainingChapter[] = [
  {
    id: 'ch-1',
    title: 'Getting Started',
    description: 'Welcome to LandHud! Learn the basics of our operation.',
    order: 1,
    forRoles: ['sms_va', 'underwriter', 'admin'],
    sections: [
      {
        id: 'sec-1-1',
        chapterId: 'ch-1',
        title: 'Welcome to LandHud',
        description: 'Introduction to our company and mission',
        videoUrl: '',
        videoDuration: '5:00',
        order: 1
      },
      {
        id: 'sec-1-2',
        chapterId: 'ch-1',
        title: 'How We Buy Land',
        description: 'Understanding our acquisition process',
        videoUrl: '',
        videoDuration: '8:00',
        order: 2
      }
    ]
  },
  {
    id: 'ch-2',
    title: 'Cold SMS Outreach',
    description: 'Master the art of cold SMS prospecting.',
    order: 2,
    forRoles: ['sms_va', 'admin'],
    sections: [
      {
        id: 'sec-2-1',
        chapterId: 'ch-2',
        title: 'LaunchControl Basics',
        description: 'Setting up and using LaunchControl',
        videoUrl: '',
        videoDuration: '12:00',
        order: 1
      },
      {
        id: 'sec-2-2',
        chapterId: 'ch-2',
        title: 'Response Handling',
        description: 'How to handle interested sellers',
        videoUrl: '',
        videoDuration: '10:00',
        order: 2
      }
    ]
  },
  {
    id: 'ch-3',
    title: 'Property Underwriting',
    description: 'Learn to value vacant land accurately.',
    order: 3,
    forRoles: ['underwriter', 'admin'],
    sections: [
      {
        id: 'sec-3-1',
        chapterId: 'ch-3',
        title: 'Finding Comps',
        description: 'How to find comparable sales',
        videoUrl: '',
        videoDuration: '15:00',
        order: 1
      },
      {
        id: 'sec-3-2',
        chapterId: 'ch-3',
        title: 'Valuation Methods',
        description: 'Different approaches to land valuation',
        videoUrl: '',
        videoDuration: '20:00',
        order: 2
      }
    ]
  }
]

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      chapters: defaultChapters,
      
      addChapter: (chapterData) => {
        const id = generateId()
        const chapters = get().chapters
        const newChapter: TrainingChapter = {
          ...chapterData,
          id,
          order: chapters.length + 1,
          sections: []
        }
        set((state) => ({ chapters: [...state.chapters, newChapter] }))
        return id
      },
      
      updateChapter: (id, updates) => {
        set((state) => ({
          chapters: state.chapters.map((ch) =>
            ch.id === id ? { ...ch, ...updates } : ch
          )
        }))
      },
      
      deleteChapter: (id) => {
        set((state) => ({
          chapters: state.chapters.filter((ch) => ch.id !== id)
        }))
      },
      
      addSection: (chapterId, sectionData) => {
        const id = generateId()
        set((state) => ({
          chapters: state.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch
            const newSection = {
              ...sectionData,
              id,
              chapterId,
              order: ch.sections.length + 1
            }
            return { ...ch, sections: [...ch.sections, newSection] }
          })
        }))
      },
      
      updateSection: (chapterId, sectionId, updates) => {
        set((state) => ({
          chapters: state.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              sections: ch.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, ...updates } : sec
              )
            }
          })
        }))
      },
      
      deleteSection: (chapterId, sectionId) => {
        set((state) => ({
          chapters: state.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              sections: ch.sections.filter((sec) => sec.id !== sectionId)
            }
          })
        }))
      },
      
      reorderChapters: (chapters) => {
        set({ chapters })
      }
    }),
    { name: 'landhud-training' }
  )
)
