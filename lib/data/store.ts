'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Lead, 
  Valuation, 
  EODReportSMS, 
  EODReportUnderwriter, 
  TrainingChapter, 
  UserRole,
  QuizAttempt,
  UserTrainingProgress,
  Resource,
  CalendarEvent,
  LeadList
} from '@/lib/types'

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

// Default chapters with full content
const defaultChapters: TrainingChapter[] = [
  {
    id: 'ch-1',
    title: 'Getting Started',
    description: 'Welcome to LandHud! Learn the basics of our operation and company culture.',
    order: 1,
    forRoles: ['sms_va', 'underwriter', 'admin'],
    sections: [
      {
        id: 'sec-1-1',
        chapterId: 'ch-1',
        title: 'Welcome to LandHud',
        description: 'Introduction to our company, mission, and what we do',
        videoUrl: '',
        videoDuration: '5:00',
        order: 1
      },
      {
        id: 'sec-1-2',
        chapterId: 'ch-1',
        title: 'How We Buy Land',
        description: 'Understanding our end-to-end land acquisition process',
        videoUrl: '',
        videoDuration: '8:00',
        order: 2
      },
      {
        id: 'sec-1-3',
        chapterId: 'ch-1',
        title: 'Team Structure & Roles',
        description: 'Meet the team and understand how each role contributes',
        videoUrl: '',
        videoDuration: '6:00',
        order: 3
      },
      {
        id: 'sec-1-4',
        chapterId: 'ch-1',
        title: 'Communication Guidelines',
        description: 'How we communicate internally and with sellers',
        videoUrl: '',
        videoDuration: '5:00',
        order: 4,
        quiz: {
          id: 'quiz-1-4',
          sectionId: 'sec-1-4',
          passingScore: 80,
          questions: [
            {
              id: 'q-1-4-1',
              question: 'What is the primary focus of LandHud?',
              options: ['Buying residential homes', 'Buying vacant land', 'Commercial real estate', 'Property management'],
              correctAnswerIndex: 1,
              explanation: 'LandHud specializes in acquiring vacant land parcels.'
            },
            {
              id: 'q-1-4-2',
              question: 'Who is typically the first point of contact with sellers?',
              options: ['Underwriters', 'SMS VA team', 'Admin', 'Closing agents'],
              correctAnswerIndex: 1,
              explanation: 'SMS VAs initiate contact through cold outreach campaigns.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'ch-2',
    title: 'Cold SMS Outreach',
    description: 'Master the art of cold SMS prospecting with LaunchControl.',
    order: 2,
    forRoles: ['sms_va', 'admin'],
    sections: [
      {
        id: 'sec-2-1',
        chapterId: 'ch-2',
        title: 'LaunchControl Basics',
        description: 'Setting up campaigns, importing lists, and navigating the platform',
        videoUrl: '',
        videoDuration: '12:00',
        order: 1
      },
      {
        id: 'sec-2-2',
        chapterId: 'ch-2',
        title: 'SMS Scripts & Messaging',
        description: 'How to craft messages that get responses',
        videoUrl: '',
        videoDuration: '10:00',
        order: 2
      },
      {
        id: 'sec-2-3',
        chapterId: 'ch-2',
        title: 'Response Handling',
        description: 'How to handle interested sellers and common objections',
        videoUrl: '',
        videoDuration: '10:00',
        order: 3
      },
      {
        id: 'sec-2-4',
        chapterId: 'ch-2',
        title: 'Lead Handoff Process',
        description: 'When and how to escalate leads to underwriters',
        videoUrl: '',
        videoDuration: '8:00',
        order: 4,
        quiz: {
          id: 'quiz-2-4',
          sectionId: 'sec-2-4',
          passingScore: 80,
          questions: [
            {
              id: 'q-2-4-1',
              question: 'When texting, how should your messages sound?',
              options: ['Formal and professional', 'Casual like real texting', 'All caps for attention', 'Very long and detailed'],
              correctAnswerIndex: 1,
              explanation: 'We want to sound like real people texting - lowercase, casual, sometimes splitting into multiple messages.'
            },
            {
              id: 'q-2-4-2',
              question: 'What should you ask a seller who is interested?',
              options: ['Their social security number', 'Why they never built on the lot', 'Their credit score', 'Their favorite color'],
              correctAnswerIndex: 1,
              explanation: 'Understanding why they never built helps us assess their motivation and any potential issues.'
            },
            {
              id: 'q-2-4-3',
              question: 'How should we present our offer?',
              options: ['Only one exact number', 'A range (e.g., $X-$Y)', 'Never mention price', 'Ask them to make an offer'],
              correctAnswerIndex: 1,
              explanation: 'We present a range to give room for negotiation and show flexibility.'
            }
          ]
        }
      },
      {
        id: 'sec-2-5',
        chapterId: 'ch-2',
        title: 'Campaign Metrics & KPIs',
        description: 'Understanding response rates and what success looks like',
        videoUrl: '',
        videoDuration: '6:00',
        order: 5
      }
    ]
  },
  {
    id: 'ch-3',
    title: 'Lead Qualification',
    description: 'Learn what makes a good lead and when to escalate.',
    order: 3,
    forRoles: ['sms_va', 'admin'],
    sections: [
      {
        id: 'sec-3-1',
        chapterId: 'ch-3',
        title: 'What Makes a Good Lead',
        description: 'Identifying motivated sellers and quality properties',
        videoUrl: '',
        videoDuration: '10:00',
        order: 1
      },
      {
        id: 'sec-3-2',
        chapterId: 'ch-3',
        title: 'Red Flags to Watch For',
        description: 'Common issues that disqualify leads',
        videoUrl: '',
        videoDuration: '8:00',
        order: 2
      },
      {
        id: 'sec-3-3',
        chapterId: 'ch-3',
        title: 'Escalation Criteria',
        description: 'When and how to pass leads to underwriters',
        videoUrl: '',
        videoDuration: '6:00',
        order: 3
      },
      {
        id: 'sec-3-4',
        chapterId: 'ch-3',
        title: 'Documentation Requirements',
        description: 'What information to capture before escalation',
        videoUrl: '',
        videoDuration: '7:00',
        order: 4,
        quiz: {
          id: 'quiz-3-4',
          sectionId: 'sec-3-4',
          passingScore: 80,
          questions: [
            {
              id: 'q-3-4-1',
              question: 'Which is a sign of a motivated seller?',
              options: ['Inherited property they don\'t want', 'Just bought the land last month', 'Plans to build soon', 'Actively using the land'],
              correctAnswerIndex: 0,
              explanation: 'Inherited properties often indicate motivation since the owner has no attachment or use for it.'
            },
            {
              id: 'q-3-4-2',
              question: 'What is a major red flag for a property?',
              options: ['Located in a rural area', 'Landlocked with no access', 'Owner lives out of state', 'Property has been owned for years'],
              correctAnswerIndex: 1,
              explanation: 'Landlocked properties with no legal access are extremely difficult to resell.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'ch-4',
    title: 'Property Underwriting',
    description: 'Learn to value vacant land accurately and identify opportunities.',
    order: 4,
    forRoles: ['underwriter', 'admin'],
    sections: [
      {
        id: 'sec-4-1',
        chapterId: 'ch-4',
        title: 'Finding Comparable Sales',
        description: 'How to find and analyze comps effectively',
        videoUrl: '',
        videoDuration: '15:00',
        order: 1
      },
      {
        id: 'sec-4-2',
        chapterId: 'ch-4',
        title: 'Valuation Methods',
        description: 'Different approaches to determining land value',
        videoUrl: '',
        videoDuration: '20:00',
        order: 2
      },
      {
        id: 'sec-4-3',
        chapterId: 'ch-4',
        title: 'Red Flags & Deal Killers',
        description: 'Issues that affect value or kill deals',
        videoUrl: '',
        videoDuration: '12:00',
        order: 3
      },
      {
        id: 'sec-4-4',
        chapterId: 'ch-4',
        title: 'Research Tools & Resources',
        description: 'Using county records, GIS, and other tools',
        videoUrl: '',
        videoDuration: '15:00',
        order: 4
      },
      {
        id: 'sec-4-5',
        chapterId: 'ch-4',
        title: 'Submitting Valuations',
        description: 'How to document and submit your analysis',
        videoUrl: '',
        videoDuration: '8:00',
        order: 5,
        quiz: {
          id: 'quiz-4-5',
          sectionId: 'sec-4-5',
          passingScore: 80,
          questions: [
            {
              id: 'q-4-5-1',
              question: 'What makes a good comparable sale?',
              options: ['Same state only', 'Similar size, location, and recent sale date', 'Any vacant land', 'Lowest priced property'],
              correctAnswerIndex: 1,
              explanation: 'Good comps share similar characteristics: acreage, location, zoning, and were sold recently.'
            },
            {
              id: 'q-4-5-2',
              question: 'Which factor most significantly affects vacant land value?',
              options: ['The weather', 'Access/road frontage', 'Previous owner\'s name', 'Day of the week'],
              correctAnswerIndex: 1,
              explanation: 'Access is critical - landlocked or limited access significantly reduces value and marketability.'
            },
            {
              id: 'q-4-5-3',
              question: 'How far back should you look for comps?',
              options: ['10+ years', '6-12 months ideally, up to 24 months', 'Only this week', 'Doesn\'t matter'],
              correctAnswerIndex: 1,
              explanation: 'Recent sales (6-12 months) are most relevant, but up to 24 months can be used in slower markets.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'ch-5',
    title: 'Making Offers',
    description: 'Pricing strategy, negotiation tactics, and closing deals.',
    order: 5,
    forRoles: ['sms_va', 'underwriter', 'admin'],
    sections: [
      {
        id: 'sec-5-1',
        chapterId: 'ch-5',
        title: 'Pricing Strategy',
        description: 'How we determine offer amounts and margins',
        videoUrl: '',
        videoDuration: '12:00',
        order: 1
      },
      {
        id: 'sec-5-2',
        chapterId: 'ch-5',
        title: 'Presenting Offers',
        description: 'Scripts and techniques for making offers',
        videoUrl: '',
        videoDuration: '10:00',
        order: 2
      },
      {
        id: 'sec-5-3',
        chapterId: 'ch-5',
        title: 'Negotiation Basics',
        description: 'How to handle counter-offers and objections',
        videoUrl: '',
        videoDuration: '15:00',
        order: 3
      },
      {
        id: 'sec-5-4',
        chapterId: 'ch-5',
        title: 'Moving to Close',
        description: 'Next steps after an accepted offer',
        videoUrl: '',
        videoDuration: '8:00',
        order: 4,
        quiz: {
          id: 'quiz-5-4',
          sectionId: 'sec-5-4',
          passingScore: 80,
          questions: [
            {
              id: 'q-5-4-1',
              question: 'Why do we present offers as a range?',
              options: ['We don\'t know what we\'re doing', 'Gives room for negotiation', 'Legal requirement', 'Random strategy'],
              correctAnswerIndex: 1,
              explanation: 'A range shows flexibility and creates room for negotiation while anchoring expectations.'
            },
            {
              id: 'q-5-4-2',
              question: 'What should we emphasize when making an offer?',
              options: ['Our company size', 'Quick close, cash, we cover closing costs', 'How cheap the land is', 'That we might change our mind'],
              correctAnswerIndex: 1,
              explanation: 'These benefits differentiate us from traditional buyers and appeal to motivated sellers.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'ch-6',
    title: 'Tools & Systems',
    description: 'Master the software and tools we use daily.',
    order: 6,
    forRoles: ['sms_va', 'underwriter', 'admin'],
    sections: [
      {
        id: 'sec-6-1',
        chapterId: 'ch-6',
        title: 'Close.com Overview',
        description: 'Our CRM for managing leads and communication',
        videoUrl: '',
        videoDuration: '15:00',
        order: 1
      },
      {
        id: 'sec-6-2',
        chapterId: 'ch-6',
        title: 'Airtable Workflows',
        description: 'How we track deals and manage data',
        videoUrl: '',
        videoDuration: '12:00',
        order: 2
      },
      {
        id: 'sec-6-3',
        chapterId: 'ch-6',
        title: 'PandaDoc for Contracts',
        description: 'Sending and managing purchase agreements',
        videoUrl: '',
        videoDuration: '10:00',
        order: 3
      },
      {
        id: 'sec-6-4',
        chapterId: 'ch-6',
        title: 'LaunchControl Deep Dive',
        description: 'Advanced features and campaign optimization',
        videoUrl: '',
        videoDuration: '20:00',
        order: 4
      },
      {
        id: 'sec-6-5',
        chapterId: 'ch-6',
        title: 'LandHud Internal Portal',
        description: 'Using this platform to submit leads and reports',
        videoUrl: '',
        videoDuration: '8:00',
        order: 5,
        quiz: {
          id: 'quiz-6-5',
          sectionId: 'sec-6-5',
          passingScore: 80,
          questions: [
            {
              id: 'q-6-5-1',
              question: 'What is Close.com used for?',
              options: ['Sending SMS campaigns', 'CRM - managing leads and calls', 'Creating contracts', 'Underwriting properties'],
              correctAnswerIndex: 1,
              explanation: 'Close.com is our CRM where we track all lead interactions and communications.'
            },
            {
              id: 'q-6-5-2',
              question: 'Which tool do we use for purchase agreements?',
              options: ['LaunchControl', 'Airtable', 'PandaDoc', 'Close.com'],
              correctAnswerIndex: 2,
              explanation: 'PandaDoc is our document signing platform for contracts and agreements.'
            }
          ]
        }
      }
    ]
  }
]

// Default resources
const defaultResources: Resource[] = [
  {
    id: 'res-1',
    title: 'SMS Scripts',
    description: 'Standard messaging templates for cold outreach and seller conversations',
    type: 'script',
    category: 'SMS Outreach',
    content: `LandHud SMS Script

When sending messages, we will start to actually sound like we're texting, this includes but is not limited to:
- Sending text messages in all lowercase
- Misspelling a word on purpose
- Typing in multiple messages

INTERESTED IN SELLING:
Option 1: "I'd have to get a bit more info before I can give an accurate offer. Curious to know is there any reason you never built on it?"
Option 2: "I just need to get a little bit more info before I can give an accurate offer" + "what's kept you from building on it, anything I should be concerned about?"

DISCOVERING IF LOT IS BUILDABLE:
Option 1: "Do you happen to know if it's buildable or not? If not, no worries at all - we can look more into it."
Option 2: "Any idea if it's buildable or not?" + "If not, no problem. We can reach out to the county"

PRESENTING OFFER RANGE:
Option 1: "My offer would be $X-$Y cash, can close within a few weeks and we handle all closing cost. If this is something that is of interest to you, would love to hop on a call to further discuss. Let me know what you think about the offer, we really loved the lot."
Option 2: "we're thinking $X to $Y cash, can close pretty quick" + "really like the lot" + "we can cover all closing costs and you can choose the title/closing firm" + "would you be open to a quick call to talk it through?"`,
    forRoles: ['sms_va', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res-2',
    title: 'Lead Qualification Checklist',
    description: 'Quick reference for what makes a qualified lead',
    type: 'checklist',
    category: 'Lead Management',
    content: `Lead Qualification Checklist

✅ MUST HAVE:
- Seller is responsive and interested
- Property has legal access (not landlocked)
- Clear title (no major liens or disputes)
- Seller can provide ownership documentation

🟡 NICE TO HAVE:
- Motivated seller (inherited, tax burden, etc.)
- Property in target counties
- Reasonable asking price or no price anchor
- Buildable lot with utilities nearby

🚫 RED FLAGS:
- Landlocked property
- HOA restrictions that limit use
- Environmental issues (wetlands, flood zone)
- Title problems or disputes
- Seller is unresponsive or difficult
- Property recently purchased (likely not motivated)`,
    forRoles: ['sms_va', 'underwriter', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res-3',
    title: 'Underwriting Template',
    description: 'Standard format for property valuations',
    type: 'template',
    category: 'Underwriting',
    content: `Property Underwriting Template

PROPERTY INFO:
- APN: [Parcel Number]
- Address: [Full Address]
- County/State: [County, State]
- Acreage: [X.XX acres]

COMPARABLE SALES (minimum 3):
1. [Address] - [Acres] - Sold [Date] - $[Price] ($[Price/Acre])
2. [Address] - [Acres] - Sold [Date] - $[Price] ($[Price/Acre])
3. [Address] - [Acres] - Sold [Date] - $[Price] ($[Price/Acre])

ANALYSIS:
- Average $/Acre from comps: $[Amount]
- Adjustments: [+/- for access, location, size, etc.]
- Estimated Market Value: $[Amount]

RECOMMENDED OFFER:
- Target Purchase Price: $[Amount] (XX% of market value)
- Max Purchase Price: $[Amount]

RED FLAGS/NOTES:
[Any concerns or special considerations]`,
    forRoles: ['underwriter', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Training store
interface TrainingState {
  chapters: TrainingChapter[]
  userProgress: Record<string, UserTrainingProgress>
  resources: Resource[]
  addChapter: (chapter: Omit<TrainingChapter, 'id' | 'sections' | 'order'>) => string
  updateChapter: (id: string, updates: Partial<TrainingChapter>) => void
  deleteChapter: (id: string) => void
  addSection: (chapterId: string, section: Omit<TrainingChapter['sections'][0], 'id' | 'chapterId' | 'order'>) => void
  updateSection: (chapterId: string, sectionId: string, updates: Partial<TrainingChapter['sections'][0]>) => void
  deleteSection: (chapterId: string, sectionId: string) => void
  reorderChapters: (chapters: TrainingChapter[]) => void
  // Progress tracking
  markSectionComplete: (userId: string, sectionId: string) => void
  submitQuizAttempt: (userId: string, attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => QuizAttempt
  getUserProgress: (userId: string) => UserTrainingProgress | undefined
  isSectionUnlocked: (userId: string, chapterId: string, sectionId: string) => boolean
  // Resources
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      chapters: defaultChapters,
      userProgress: {},
      resources: defaultResources,
      
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
      },

      // Progress tracking
      markSectionComplete: (userId, sectionId) => {
        set((state) => {
          const existing = state.userProgress[userId] || {
            userId,
            completedSections: [],
            quizAttempts: [],
            lastAccessedAt: new Date().toISOString()
          }
          
          if (existing.completedSections.includes(sectionId)) {
            return state
          }

          return {
            userProgress: {
              ...state.userProgress,
              [userId]: {
                ...existing,
                completedSections: [...existing.completedSections, sectionId],
                lastAccessedAt: new Date().toISOString()
              }
            }
          }
        })
      },

      submitQuizAttempt: (userId, attemptData) => {
        const attempt: QuizAttempt = {
          ...attemptData,
          id: generateId(),
          completedAt: new Date().toISOString()
        }

        set((state) => {
          const existing = state.userProgress[userId] || {
            userId,
            completedSections: [],
            quizAttempts: [],
            lastAccessedAt: new Date().toISOString()
          }

          const newProgress: UserTrainingProgress = {
            ...existing,
            quizAttempts: [...existing.quizAttempts, attempt],
            lastAccessedAt: new Date().toISOString()
          }

          // If passed, mark section as complete
          if (attempt.passed && !existing.completedSections.includes(attempt.sectionId)) {
            newProgress.completedSections = [...existing.completedSections, attempt.sectionId]
          }

          return {
            userProgress: {
              ...state.userProgress,
              [userId]: newProgress
            }
          }
        })

        return attempt
      },

      getUserProgress: (userId) => {
        return get().userProgress[userId]
      },

      isSectionUnlocked: (userId, chapterId, sectionId) => {
        const { chapters, userProgress } = get()
        const chapter = chapters.find(c => c.id === chapterId)
        if (!chapter) return false

        const sectionIndex = chapter.sections.findIndex(s => s.id === sectionId)
        if (sectionIndex === 0) return true // First section always unlocked

        const progress = userProgress[userId]
        if (!progress) return sectionIndex === 0

        // Check if previous section is completed
        const prevSection = chapter.sections[sectionIndex - 1]
        if (!prevSection) return true

        // If prev section has a quiz, must have passed it
        if (prevSection.quiz) {
          const passedQuiz = progress.quizAttempts.some(
            a => a.sectionId === prevSection.id && a.passed
          )
          return passedQuiz
        }

        // Otherwise just needs to be marked complete
        return progress.completedSections.includes(prevSection.id)
      },

      // Resources
      addResource: (resourceData) => {
        const now = new Date().toISOString()
        const resource: Resource = {
          ...resourceData,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        }
        set((state) => ({ resources: [...state.resources, resource] }))
      },

      updateResource: (id, updates) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          )
        }))
      },

      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id)
        }))
      }
    }),
    { name: 'landhud-training' }
  )
)

// Calendar store
interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => string
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: Date) => CalendarEvent[]
  getEventsForMonth: (year: number, month: number) => CalendarEvent[]
}

// Generate pay dates for the year
const generatePayDates = (): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  const currentYear = new Date().getFullYear()
  
  for (let month = 0; month < 12; month++) {
    // 1st of the month
    events.push({
      id: `pay-${currentYear}-${month}-1`,
      title: 'Pay Day 💰',
      description: 'Bi-monthly payment',
      date: new Date(currentYear, month, 1).toISOString().split('T')[0],
      type: 'pay_day',
      recurring: 'monthly',
      recurringDay: 1,
      createdBy: 'system',
      color: 'bg-green-500'
    })
    
    // 15th of the month
    events.push({
      id: `pay-${currentYear}-${month}-15`,
      title: 'Pay Day 💰',
      description: 'Bi-monthly payment',
      date: new Date(currentYear, month, 15).toISOString().split('T')[0],
      type: 'pay_day',
      recurring: 'monthly',
      recurringDay: 15,
      createdBy: 'system',
      color: 'bg-green-500'
    })
  }
  
  return events
}

const defaultEvents: CalendarEvent[] = [
  ...generatePayDates(),
  {
    id: 'meeting-1',
    title: 'Weekly Team Standup',
    description: 'Weekly check-in with the whole team',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    endTime: '10:30',
    type: 'meeting',
    recurring: 'weekly',
    createdBy: 'admin-1',
    color: 'bg-blue-500'
  }
]

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: defaultEvents,
      
      addEvent: (eventData) => {
        const id = generateId()
        const event: CalendarEvent = { ...eventData, id }
        set((state) => ({ events: [...state.events, event] }))
        return id
      },
      
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          )
        }))
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id)
        }))
      },
      
      getEventsForDate: (date) => {
        const { events } = get()
        const dateStr = date.toISOString().split('T')[0]
        const dayOfMonth = date.getDate()
        const dayOfWeek = date.getDay()
        
        return events.filter(event => {
          // Direct date match
          if (event.date === dateStr) return true
          
          // Recurring events
          if (event.recurring === 'monthly' && event.recurringDay === dayOfMonth) {
            return true
          }
          
          if (event.recurring === 'weekly') {
            const eventDate = new Date(event.date)
            if (eventDate.getDay() === dayOfWeek) return true
          }
          
          return false
        })
      },
      
      getEventsForMonth: (year, month) => {
        const { events } = get()
        
        return events.filter(event => {
          const eventDate = new Date(event.date)
          
          // Direct date match for this month
          if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            return true
          }
          
          // Monthly recurring
          if (event.recurring === 'monthly') {
            return true
          }
          
          // Weekly recurring (always shows)
          if (event.recurring === 'weekly') {
            return true
          }
          
          return false
        })
      }
    }),
    { name: 'landhud-calendar' }
  )
)

// Lead Lists store (for incoming LandPortal files)
interface LeadListsState {
  leadLists: LeadList[]
  addLeadList: (list: Omit<LeadList, 'id' | 'receivedAt'>) => string
  updateLeadList: (id: string, updates: Partial<LeadList>) => void
  deleteLeadList: (id: string) => void
  getLeadListsByStatus: (status: LeadList['status']) => LeadList[]
}

export const useLeadListsStore = create<LeadListsState>()(
  persist(
    (set, get) => ({
      leadLists: [],
      
      addLeadList: (listData) => {
        const id = generateId()
        const newList: LeadList = {
          ...listData,
          id,
          receivedAt: new Date().toISOString()
        }
        set((state) => ({ leadLists: [newList, ...state.leadLists] }))
        return id
      },
      
      updateLeadList: (id, updates) => {
        set((state) => ({
          leadLists: state.leadLists.map((list) =>
            list.id === id ? { ...list, ...updates } : list
          )
        }))
      },
      
      deleteLeadList: (id) => {
        set((state) => ({
          leadLists: state.leadLists.filter((list) => list.id !== id)
        }))
      },
      
      getLeadListsByStatus: (status) => {
        return get().leadLists.filter((list) => list.status === status)
      }
    }),
    { name: 'landhud-lead-lists' }
  )
)
