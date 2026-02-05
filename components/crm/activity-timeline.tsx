'use client'

import { formatDistanceToNow, format } from 'date-fns'
import {
  UserPlusIcon,
  StickyNoteIcon,
  MessageSquareIcon,
  MessageSquareMoreIcon,
  PhoneIcon,
  PhoneCallIcon,
  MailIcon,
  MailOpenIcon,
  ArrowRightIcon,
  CalculatorIcon,
  DollarSignIcon,
  FileTextIcon,
  CheckSquareIcon,
  CheckCircleIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { CRMActivity, ActivityType } from '@/lib/types/crm'
import { PIPELINE_STAGES } from '@/lib/types/crm'

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  lead_created: UserPlusIcon,
  note_added: StickyNoteIcon,
  sms_sent: MessageSquareIcon,
  sms_received: MessageSquareMoreIcon,
  call_logged: PhoneIcon,
  call_scheduled: PhoneCallIcon,
  email_sent: MailIcon,
  email_received: MailOpenIcon,
  stage_changed: ArrowRightIcon,
  comp_added: CalculatorIcon,
  comp_updated: CalculatorIcon,
  offer_made: DollarSignIcon,
  document_added: FileTextIcon,
  task_created: CheckSquareIcon,
  task_completed: CheckCircleIcon,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  lead_created: 'bg-blue-500/10 text-blue-600',
  note_added: 'bg-yellow-500/10 text-yellow-600',
  sms_sent: 'bg-green-500/10 text-green-600',
  sms_received: 'bg-emerald-500/10 text-emerald-600',
  call_logged: 'bg-purple-500/10 text-purple-600',
  call_scheduled: 'bg-purple-500/10 text-purple-600',
  email_sent: 'bg-cyan-500/10 text-cyan-600',
  email_received: 'bg-teal-500/10 text-teal-600',
  stage_changed: 'bg-indigo-500/10 text-indigo-600',
  comp_added: 'bg-orange-500/10 text-orange-600',
  comp_updated: 'bg-orange-500/10 text-orange-600',
  offer_made: 'bg-pink-500/10 text-pink-600',
  document_added: 'bg-gray-500/10 text-gray-600',
  task_created: 'bg-slate-500/10 text-slate-600',
  task_completed: 'bg-green-500/10 text-green-600',
}

interface ActivityTimelineProps {
  activities: CRMActivity[]
  maxHeight?: string
}

export function ActivityTimeline({ activities, maxHeight = '400px' }: ActivityTimelineProps) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MessageSquareIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    )
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            isLast={index === activities.length - 1}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

interface ActivityItemProps {
  activity: CRMActivity
  isLast: boolean
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const Icon = ACTIVITY_ICONS[activity.type as ActivityType] || MessageSquareIcon
  const colorClass = ACTIVITY_COLORS[activity.type as ActivityType] || 'bg-gray-500/10 text-gray-600'
  
  const initials = activity.performed_by_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 -bottom-4 w-px bg-border" />
      )}
      
      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 size-8 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="size-4" />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {activity.description}
              </p>
            )}
            
            {/* Stage change badge */}
            {activity.type === 'stage_changed' && activity.old_value && activity.new_value && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {PIPELINE_STAGES[activity.old_value as keyof typeof PIPELINE_STAGES]?.label || activity.old_value}
                </Badge>
                <ArrowRightIcon className="size-3 text-muted-foreground" />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${PIPELINE_STAGES[activity.new_value as keyof typeof PIPELINE_STAGES]?.bgColor || ''} ${PIPELINE_STAGES[activity.new_value as keyof typeof PIPELINE_STAGES]?.color || ''} border-0`}
                >
                  {PIPELINE_STAGES[activity.new_value as keyof typeof PIPELINE_STAGES]?.label || activity.new_value}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {/* Performer info */}
        <div className="flex items-center gap-1.5 mt-2">
          <Avatar className="size-5">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {activity.performed_by_name}
          </span>
        </div>
      </div>
    </div>
  )
}

// Compact version for dashboard/overview
export function ActivityTimelineCompact({ activities }: { activities: CRMActivity[] }) {
  const recentActivities = activities.slice(0, 5)
  
  return (
    <div className="space-y-3">
      {recentActivities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.type as ActivityType] || MessageSquareIcon
        const colorClass = ACTIVITY_COLORS[activity.type as ActivityType] || 'bg-gray-500/10 text-gray-600'
        
        return (
          <div key={activity.id} className="flex items-start gap-2">
            <div className={`flex-shrink-0 size-6 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="size-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
