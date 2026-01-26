// LandHud Internal Types

// User roles
export type UserRole = 'admin' | 'sms_va' | 'underwriter'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Dashboard metrics
export interface DashboardMetrics {
  textsSent: number
  textsReceived: number
  responseRate: number
  leadsGenerated: number
  hotLeads: number
  pendingValuations: number
  offersMade: number
  contractsSent: number
  contractsSigned: number
  pipelineValue: number
  avgDealSize: number
}

// Lead submitted by SMS VA
export interface Lead {
  id: string
  submittedBy: string
  submittedAt: string
  status: 'pending_valuation' | 'one_valuation' | 'valued' | 'offer_made' | 'call_booked' | 'closed' | 'dead'
  
  // Property info
  ownerName: string
  ownerPhone: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyCounty: string
  parcelId: string
  acreage: number
  askingPrice?: number
  notes?: string
  
  // Valuations
  valuations: Valuation[]
  averageValuation?: number
  
  // Outcome
  calComLink?: string
  callScheduledAt?: string
}

// Underwriter valuation
export interface Valuation {
  id: string
  leadId: string
  underwriterId: string
  underwriterName: string
  submittedAt: string
  valuationAmount: number
  reasoning: string
  comps?: string
  redFlags?: string[]
}

// EOD Report - SMS VA
export interface EODReportSMS {
  id: string
  date: string
  submittedBy: string
  submittedAt: string
  
  textsSent: number
  textsReceived: number
  responseRate: number // calculated
  leadsGenerated: number
  hotLeads: number
  callsBooked: number
  challenges?: string
  notes?: string
}

// EOD Report - Underwriter
export interface EODReportUnderwriter {
  id: string
  date: string
  submittedBy: string
  submittedAt: string
  
  propertiesResearched: number
  propertiesApproved: number
  propertiesRejected: number
  avgTimePerComp: number // in minutes
  hoursWorked: number
  countiesWorked: string[]
  redFlagsEncountered: string[]
  notes?: string
}

// Training
export interface TrainingChapter {
  id: string
  title: string
  description: string
  order: number
  forRoles: UserRole[]
  sections: TrainingSection[]
}

export interface TrainingSection {
  id: string
  chapterId: string
  title: string
  description?: string
  videoUrl?: string
  videoDuration?: string
  resources?: TrainingResource[]
  order: number
  quiz?: Quiz
}

export interface TrainingResource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'doc' | 'script'
  url?: string
  content?: string
}

// Quiz system
export interface Quiz {
  id: string
  sectionId: string
  questions: QuizQuestion[]
  passingScore: number // percentage (e.g., 80)
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
  explanation?: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  sectionId: string
  userId: string
  answers: number[] // indices of selected answers
  score: number // percentage
  passed: boolean
  completedAt: string
}

// User training progress
export interface UserTrainingProgress {
  userId: string
  completedSections: string[] // section IDs
  quizAttempts: QuizAttempt[]
  currentChapter?: string
  currentSection?: string
  lastAccessedAt: string
}

// Resources
export interface Resource {
  id: string
  title: string
  description: string
  type: 'script' | 'guide' | 'template' | 'checklist' | 'video'
  category: string
  content?: string
  url?: string
  forRoles: UserRole[]
  createdAt: string
  updatedAt: string
}

// Calendar
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // ISO date string
  time?: string // HH:mm format
  endTime?: string
  type: 'pay_day' | 'meeting' | 'deadline' | 'holiday' | 'other'
  recurring?: 'none' | 'weekly' | 'biweekly' | 'monthly'
  recurringDay?: number // day of month for monthly recurring
  createdBy: string
  color?: string
}
