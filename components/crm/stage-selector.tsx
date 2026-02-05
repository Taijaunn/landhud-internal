'use client'

import { useState } from 'react'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

import type { PipelineStage } from '@/lib/types/crm'
import { PIPELINE_STAGES } from '@/lib/types/crm'
import { useCRMStore } from '@/lib/data/crm-store'

interface StageSelectorProps {
  leadId: string
  currentStage: PipelineStage
  userId: string
  userName: string
  size?: 'sm' | 'md' | 'lg'
}

export function StageSelector({ 
  leadId, 
  currentStage, 
  userId, 
  userName,
  size = 'md'
}: StageSelectorProps) {
  const [updating, setUpdating] = useState(false)
  const { updateLeadStage } = useCRMStore()
  
  const currentConfig = PIPELINE_STAGES[currentStage]
  const stages = Object.entries(PIPELINE_STAGES) as [PipelineStage, typeof currentConfig][]

  const handleStageChange = async (stage: PipelineStage) => {
    if (stage === currentStage) return
    
    setUpdating(true)
    try {
      await updateLeadStage(leadId, stage, userId, userName)
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setUpdating(false)
    }
  }

  const sizeClasses = {
    sm: 'h-7 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`${sizeClasses[size]} ${currentConfig.bgColor} border-0`}
          disabled={updating}
        >
          <span className={currentConfig.color}>{currentConfig.label}</span>
          <ChevronDownIcon className="size-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {stages.map(([stage, config]) => (
          <DropdownMenuItem
            key={stage}
            onClick={() => handleStageChange(stage)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${config.bgColor.replace('/10', '')}`} />
              <span>{config.label}</span>
            </div>
            {stage === currentStage && (
              <CheckIcon className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Inline stage badges (for lists)
export function StageBadge({ stage, size = 'sm' }: { stage: PipelineStage; size?: 'sm' | 'md' }) {
  const config = PIPELINE_STAGES[stage]
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.color} border-0 ${
        size === 'sm' ? 'text-xs px-2 py-0' : 'text-sm px-2.5 py-0.5'
      }`}
    >
      {config.label}
    </Badge>
  )
}
