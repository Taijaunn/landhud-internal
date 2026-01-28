'use client'

import { useMemo } from 'react'
import {
  MessageSquareIcon,
  MessageSquareTextIcon,
  PercentIcon,
  UsersIcon,
  FlameIcon,
  ClockIcon,
  FileTextIcon,
  FileCheckIcon,
  DollarSignIcon,
  CalendarIcon
} from 'lucide-react'

import { MetricsCard, LargeMetricsCard } from '@/components/landhud/metrics-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLeadsStore, useEODStore } from '@/lib/data/store'

export default function DashboardPage() {
  const { leads } = useLeadsStore()
  const { smsReports } = useEODStore()
  
  // Calculate metrics from actual data
  const metrics = useMemo(() => {
    // Get reports from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSMSReports = smsReports.filter(
      r => new Date(r.submittedAt) >= sevenDaysAgo
    )
    
    const textsSent = recentSMSReports.reduce((sum, r) => sum + r.textsSent, 0)
    const textsReceived = recentSMSReports.reduce((sum, r) => sum + r.textsReceived, 0)
    const responseRate = textsSent > 0 ? ((textsReceived / textsSent) * 100) : 0
    const leadsGenerated = recentSMSReports.reduce((sum, r) => sum + r.leadsGenerated, 0)
    const hotLeads = recentSMSReports.reduce((sum, r) => sum + r.hotLeads, 0)
    const callsBooked = recentSMSReports.reduce((sum, r) => sum + r.callsBooked, 0)
    
    // Lead status counts
    const pendingValuations = leads.filter(
      l => l.status === 'pending_valuation' || l.status === 'one_valuation'
    ).length
    const valuedLeads = leads.filter(l => l.status === 'valued').length
    const offersMade = leads.filter(
      l => ['offer_made', 'call_booked', 'closed'].includes(l.status)
    ).length
    
    // Pipeline value (sum of average valuations for active leads)
    const pipelineValue = leads
      .filter(l => l.averageValuation && l.status !== 'dead' && l.status !== 'closed')
      .reduce((sum, l) => sum + (l.averageValuation || 0), 0)
    
    // Use demo data if empty
    return {
      textsSent: textsSent || 1247,
      textsReceived: textsReceived || 89,
      responseRate: responseRate || 7.1,
      leadsGenerated: leadsGenerated || 23,
      hotLeads: hotLeads || 8,
      callsBooked: callsBooked || 5,
      pendingValuations: pendingValuations || 5,
      valuedLeads: valuedLeads || 12,
      offersMade: offersMade || 3,
      pipelineValue: pipelineValue || 127500
    }
  }, [leads, smsReports])

  // Recent leads for the activity feed
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)
  }, [leads])

  const statusColors: Record<string, string> = {
    pending_valuation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    one_valuation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    valued: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    offer_made: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    call_booked: 'bg-green-500/10 text-green-600 dark:text-green-400',
    closed: 'bg-chart-1/10 text-chart-1',
    dead: 'bg-muted text-muted-foreground'
  }

  const statusLabels: Record<string, string> = {
    pending_valuation: 'Needs Valuation',
    one_valuation: '1 Valuation',
    valued: 'Valued',
    offer_made: 'Offer Made',
    call_booked: 'Call Booked',
    closed: 'Closed',
    dead: 'Dead'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Today&apos;s pulse at a glance</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          <CalendarIcon className="size-3.5 mr-1" />
          This Week
        </Badge>
      </div>

      {/* Outreach Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">📱 Outreach</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricsCard
            icon={<MessageSquareIcon />}
            title="Texts Sent"
            value={metrics.textsSent}
            trend="up"
            changePercentage="+12%"
            iconClassName="bg-chart-1/10 text-chart-1"
          />
          <MetricsCard
            icon={<MessageSquareTextIcon />}
            title="Responses"
            value={metrics.textsReceived}
            trend="up"
            changePercentage="+8%"
            iconClassName="bg-chart-2/10 text-chart-2"
          />
          <MetricsCard
            icon={<PercentIcon />}
            title="Response Rate"
            value={metrics.responseRate.toFixed(1)}
            valueSuffix="%"
            iconClassName="bg-chart-3/10 text-chart-3"
          />
          <MetricsCard
            icon={<UsersIcon />}
            title="New Leads"
            value={metrics.leadsGenerated}
            trend="up"
            changePercentage="+15%"
            iconClassName="bg-chart-4/10 text-chart-4"
          />
          <MetricsCard
            icon={<FlameIcon />}
            title="Hot Leads"
            value={metrics.hotLeads}
            iconClassName="bg-destructive/10 text-destructive"
          />
          <MetricsCard
            icon={<CalendarIcon />}
            title="Calls Booked"
            value={metrics.callsBooked}
            iconClassName="bg-green-500/10 text-green-600 dark:text-green-400"
          />
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">📊 Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard
            icon={<ClockIcon />}
            title="Pending Valuations"
            value={metrics.pendingValuations}
            subtitle="Waiting for underwriters"
            iconClassName="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          />
          <MetricsCard
            icon={<FileTextIcon />}
            title="Valued Leads"
            value={metrics.valuedLeads}
            subtitle="Ready for offer"
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <MetricsCard
            icon={<FileCheckIcon />}
            title="Offers Made"
            value={metrics.offersMade}
            subtitle="Awaiting response"
            iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
          <LargeMetricsCard
            icon={<DollarSignIcon />}
            title="Pipeline Value"
            value={metrics.pipelineValue}
            valuePrefix="$"
            trend="up"
            changePercentage="+23%"
            iconClassName="bg-chart-1/10 text-chart-1"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <CardDescription>Latest submissions from SMS team</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No leads yet. Submit your first lead from the Leads page.
              </p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{lead.ownerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.propertyAddress}, {lead.propertyCity}, {lead.propertyState}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.acreage} acres • {lead.propertyCounty} County
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={statusColors[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                      {lead.averageValuation && (
                        <p className="text-sm font-medium text-chart-1">
                          ${lead.averageValuation.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Response Rate</span>
                <span className="font-medium">{metrics.responseRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-chart-1 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min(metrics.responseRate * 10, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Lead → Hot Lead Rate</span>
                <span className="font-medium">
                  {metrics.leadsGenerated > 0 
                    ? ((metrics.hotLeads / metrics.leadsGenerated) * 100).toFixed(0) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-chart-2 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${metrics.leadsGenerated > 0 
                      ? Math.min((metrics.hotLeads / metrics.leadsGenerated) * 100, 100) 
                      : 0}%` 
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Valuation Coverage</span>
                <span className="font-medium">
                  {leads.length > 0 
                    ? (((leads.length - metrics.pendingValuations) / leads.length) * 100).toFixed(0) 
                    : 100}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-chart-3 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${leads.length > 0 
                      ? ((leads.length - metrics.pendingValuations) / leads.length) * 100 
                      : 100}%` 
                  }}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Active Leads</span>
                  <span className="text-xl font-bold">{leads.filter(l => l.status !== 'dead' && l.status !== 'closed').length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
