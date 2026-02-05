'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { 
  FlameIcon, 
  StarIcon,
  LandPlotIcon,
  GripVerticalIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import type { CRMLead, PipelineStage } from '@/lib/types/crm'
import { PIPELINE_STAGES } from '@/lib/types/crm'
import { useCRMStore } from '@/lib/data/crm-store'

interface PipelineBoardProps {
  leads: CRMLead[]
  userId: string
  userName: string
}

export function PipelineBoard({ leads, userId, userName }: PipelineBoardProps) {
  const { updateLeadStage } = useCRMStore()
  
  // Group leads by stage
  const groupedLeads = useMemo(() => {
    const groups: Record<PipelineStage, CRMLead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      negotiating: [],
      offer_sent: [],
      under_contract: [],
      closed_won: [],
      closed_lost: [],
      dead: [],
    }
    
    leads.forEach((lead) => {
      if (groups[lead.stage]) {
        groups[lead.stage].push(lead)
      }
    })
    
    return groups
  }, [leads])

  // Active stages (exclude dead/closed for main view)
  const activeStages: PipelineStage[] = [
    'new',
    'contacted', 
    'qualified',
    'negotiating',
    'offer_sent',
    'under_contract',
  ]
  
  const closedStages: PipelineStage[] = ['closed_won', 'closed_lost', 'dead']

  const handleDrop = async (leadId: string, newStage: PipelineStage) => {
    await updateLeadStage(leadId, newStage, userId, userName)
  }

  return (
    <div className="space-y-4">
      {/* Active Pipeline */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {activeStages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              leads={groupedLeads[stage]}
              onDrop={handleDrop}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Closed Stages (collapsible summary) */}
      <div className="grid grid-cols-3 gap-4">
        {closedStages.map((stage) => (
          <ClosedStageCard
            key={stage}
            stage={stage}
            leads={groupedLeads[stage]}
          />
        ))}
      </div>
    </div>
  )
}

interface PipelineColumnProps {
  stage: PipelineStage
  leads: CRMLead[]
  onDrop: (leadId: string, stage: PipelineStage) => void
}

function PipelineColumn({ stage, leads, onDrop }: PipelineColumnProps) {
  const config = PIPELINE_STAGES[stage]
  const totalValue = leads.reduce((sum, lead) => sum + (lead.offer_price || 0), 0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-primary')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-primary')
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      onDrop(leadId, stage)
    }
  }

  return (
    <div 
      className="flex-shrink-0 w-72"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${config.bgColor.replace('/10', '')}`} />
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {leads.length}
              </Badge>
            </div>
          </div>
          {totalValue > 0 && (
            <p className="text-xs text-muted-foreground">
              ${totalValue.toLocaleString()} total
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-2">
              {leads.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  Drop leads here
                </div>
              ) : (
                leads.map((lead) => (
                  <PipelineLeadCard key={lead.id} lead={lead} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function PipelineLeadCard({ lead }: { lead: CRMLead }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50')
  }

  return (
    <Link href={`/crm/leads/${lead.id}`}>
      <Card 
        className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <GripVerticalIcon className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium text-sm truncate">
                  {lead.owner_first_name} {lead.owner_last_name}
                </p>
                {lead.is_hot && <FlameIcon className="size-3 text-orange-500 flex-shrink-0" />}
                {lead.is_starred && <StarIcon className="size-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {lead.property_city}, {lead.property_state}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <LandPlotIcon className="size-3" />
                  <span>{lead.acreage} ac</span>
                </div>
                {lead.offer_price && (
                  <span className="text-xs font-medium text-green-600">
                    ${lead.offer_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ClosedStageCard({ stage, leads }: { stage: PipelineStage; leads: CRMLead[] }) {
  const config = PIPELINE_STAGES[stage]
  const totalValue = leads.reduce((sum, lead) => sum + (lead.offer_price || 0), 0)

  return (
    <Card className={`${config.bgColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {leads.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">
          ${totalValue.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {leads.length} leads
        </p>
      </CardContent>
    </Card>
  )
}
