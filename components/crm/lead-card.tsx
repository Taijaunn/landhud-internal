'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  PhoneIcon,
  MapPinIcon,
  LandPlotIcon,
  StarIcon,
  FlameIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { CRMLead } from '@/lib/types/crm'
import { PIPELINE_STAGES, LEAD_SOURCES } from '@/lib/types/crm'
import { useCRMStore } from '@/lib/data/crm-store'

interface LeadCardProps {
  lead: CRMLead
  compact?: boolean
}

export function LeadCard({ lead, compact = false }: LeadCardProps) {
  const { updateLead } = useCRMStore()
  
  const stageConfig = PIPELINE_STAGES[lead.stage]
  const sourceConfig = LEAD_SOURCES[lead.source]
  
  const toggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await updateLead(lead.id, { is_starred: !lead.is_starred })
  }
  
  const toggleHot = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await updateLead(lead.id, { is_hot: !lead.is_hot })
  }

  if (compact) {
    return (
      <Link href={`/crm/leads/${lead.id}`}>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {lead.owner_first_name} {lead.owner_last_name}
                  </p>
                  {lead.is_hot && <FlameIcon className="size-4 text-orange-500" />}
                  {lead.is_starred && <StarIcon className="size-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {lead.property_address}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`${stageConfig.bgColor} ${stageConfig.color} border-0 text-xs`}>
                    {stageConfig.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {lead.acreage} acres
                  </span>
                </div>
              </div>
              {lead.offer_price && (
                <p className="font-semibold text-green-600">
                  ${lead.offer_price.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/crm/leads/${lead.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold text-base">
                  {lead.owner_first_name} {lead.owner_last_name}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <PhoneIcon className="size-3" />
                  {lead.owner_phone}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {lead.is_hot && (
                  <Button variant="ghost" size="icon" className="size-7" onClick={toggleHot}>
                    <FlameIcon className="size-4 text-orange-500" />
                  </Button>
                )}
                {lead.is_starred && (
                  <Button variant="ghost" size="icon" className="size-7" onClick={toggleStar}>
                    <StarIcon className="size-4 text-yellow-500 fill-yellow-500" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${stageConfig.bgColor} ${stageConfig.color} border-0`}>
                {stageConfig.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleStar}>
                    <StarIcon className="size-4 mr-2" />
                    {lead.is_starred ? 'Remove Star' : 'Star Lead'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleHot}>
                    <FlameIcon className="size-4 mr-2" />
                    {lead.is_hot ? 'Remove Hot' : 'Mark as Hot'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Delete Lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Property Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <MapPinIcon className="size-3.5 text-muted-foreground" />
              <span>{lead.property_address}</span>
            </div>
            <p className="text-sm text-muted-foreground pl-4">
              {lead.property_city}, {lead.property_state} ({lead.property_county} County)
            </p>
          </div>
          
          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <LandPlotIcon className="size-3.5 text-muted-foreground" />
              <span>{lead.acreage} acres</span>
            </div>
            <span className="text-muted-foreground">APN: {lead.apn}</span>
          </div>
          
          {/* Pricing */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Source: </span>
              <span>{sourceConfig.label}</span>
            </div>
            {lead.offer_price && (
              <p className="font-semibold text-green-600">
                ${lead.offer_price.toLocaleString()}
              </p>
            )}
          </div>
          
          {/* Activity indicators */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-3">
              {lead.notes_count > 0 && (
                <span>{lead.notes_count} notes</span>
              )}
              {lead.activities_count > 0 && (
                <span>{lead.activities_count} activities</span>
              )}
            </div>
            {lead.last_contacted_at && (
              <span>
                Last contact: {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
