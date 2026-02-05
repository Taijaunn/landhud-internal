'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  UsersIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ClockIcon,
  ArrowRightIcon,
  FlameIcon,
  MessageSquareIcon,
  PhoneIcon,
  CalendarIcon,
  PlusIcon,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { LeadCard } from '@/components/crm/lead-card'
import { ActivityTimelineCompact } from '@/components/crm/activity-timeline'
import { StageBadge } from '@/components/crm/stage-selector'

import { useCRMStore } from '@/lib/data/crm-store'
import { useUserStore } from '@/lib/data/store'
import { PIPELINE_STAGES, type PipelineStage } from '@/lib/types/crm'

export default function CRMDashboardPage() {
  const { leads, leadsLoading, pipelineSummary, fetchLeads, fetchPipelineSummary } = useCRMStore()
  const { currentUserId, currentUserName } = useUserStore()

  useEffect(() => {
    fetchLeads()
    fetchPipelineSummary()
  }, [fetchLeads, fetchPipelineSummary])

  // Calculate stats
  const totalLeads = leads.length
  const hotLeads = leads.filter(l => l.is_hot).length
  const totalValue = leads.reduce((sum, l) => sum + (l.offer_price || 0), 0)
  const recentLeads = leads.slice(0, 5)
  
  // Get recent activities from all leads
  const starredLeads = leads.filter(l => l.is_starred).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">Manage your land acquisition pipeline</p>
        </div>
        <Button asChild>
          <Link href="/crm/leads/new">
            <PlusIcon className="size-4 mr-2" />
            Add Lead
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadsLoading ? <Skeleton className="h-8 w-16" /> : totalLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              In pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <FlameIcon className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {leadsLoading ? <Skeleton className="h-8 w-16" /> : hotLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSignIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leadsLoading ? <Skeleton className="h-8 w-16" /> : `$${totalValue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Total offer value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUpIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadsLoading ? <Skeleton className="h-8 w-16" /> : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline Overview</CardTitle>
              <CardDescription>Leads by stage</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/crm/pipeline">
                View Pipeline
                <ArrowRightIcon className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stage) => {
              const summary = pipelineSummary.find(s => s.stage === stage)
              const config = PIPELINE_STAGES[stage]
              
              return (
                <Link 
                  key={stage}
                  href={`/crm/leads?stage=${stage}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors min-w-[140px]"
                >
                  <div className={`size-3 rounded-full ${config.bgColor.replace('/10', '')}`} />
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-2xl font-bold">{summary?.count || 0}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest additions to your pipeline</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/crm/leads">
                  View All
                  <ArrowRightIcon className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="size-8 mx-auto mb-2 opacity-50" />
                <p>No leads yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/crm/leads/new">Add Your First Lead</Link>
                </Button>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} compact />
              ))
            )}
          </CardContent>
        </Card>

        {/* Starred / Priority Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Priority Leads</CardTitle>
                <CardDescription>Starred and hot leads</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : starredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FlameIcon className="size-8 mx-auto mb-2 opacity-50" />
                <p>No priority leads</p>
                <p className="text-sm">Star or mark leads as hot to see them here</p>
              </div>
            ) : (
              starredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} compact />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/crm/leads/new">
                <PlusIcon className="size-5 mb-2" />
                <span>Add New Lead</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/crm/pipeline">
                <TrendingUpIcon className="size-5 mb-2" />
                <span>View Pipeline</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/crm/leads?is_hot=true">
                <FlameIcon className="size-5 mb-2" />
                <span>Hot Leads</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/crm/comps">
                <DollarSignIcon className="size-5 mb-2" />
                <span>Recent Comps</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
