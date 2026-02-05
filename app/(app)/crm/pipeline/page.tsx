'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { PipelineBoard } from '@/components/crm/pipeline-board'

import { useCRMStore } from '@/lib/data/crm-store'
import { useUserStore } from '@/lib/data/store'

export default function CRMPipelinePage() {
  const { leads, leadsLoading, fetchLeads, fetchPipelineSummary } = useCRMStore()
  const { currentUserId, currentUserName } = useUserStore()

  useEffect(() => {
    fetchLeads()
    fetchPipelineSummary()
  }, [fetchLeads, fetchPipelineSummary])

  const handleRefresh = () => {
    fetchLeads()
    fetchPipelineSummary()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop leads between stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={leadsLoading}>
            <RefreshCwIcon className={`size-4 ${leadsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/crm/leads/new">
              <PlusIcon className="size-4 mr-2" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Pipeline Board */}
      {leadsLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="flex-shrink-0 w-72 h-[600px]" />
          ))}
        </div>
      ) : (
        <PipelineBoard 
          leads={leads} 
          userId={currentUserId}
          userName={currentUserName}
        />
      )}
    </div>
  )
}
