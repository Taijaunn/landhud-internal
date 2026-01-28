'use client'

import { useState, useMemo } from 'react'
import {
  SearchIcon,
  MapPinIcon,
  LandPlotIcon,
  DollarSignIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

import { useLeadsStore, useUserStore } from '@/lib/data/store'
import type { Lead } from '@/lib/types'

const RED_FLAGS = [
  'Landlocked',
  'Wetlands',
  'Flood zone',
  'HOA restrictions',
  'Environmental issues',
  'Access issues',
  'Zoning problems',
  'Title issues',
  'Back taxes owed',
  'Liens on property'
]

export default function ValuationsPage() {
  const { leads, addValuation } = useLeadsStore()
  const { currentUserId, currentUserName } = useUserStore()
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [valuationAmount, setValuationAmount] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [comps, setComps] = useState('')
  const [redFlags, setRedFlags] = useState<string[]>([])

  // Filter leads needing valuation
  const pendingLeads = useMemo(() => {
    return leads.filter(l => {
      // Show leads that need valuation
      if (l.status === 'pending_valuation') return true
      // Show leads with only 1 valuation (if current user hasn't valued yet)
      if (l.status === 'one_valuation') {
        const alreadyValued = l.valuations.some(v => v.underwriterId === currentUserId)
        return !alreadyValued
      }
      return false
    }).sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
  }, [leads, currentUserId])

  // Leads I've valued
  const myValuedLeads = useMemo(() => {
    return leads.filter(l => 
      l.valuations.some(v => v.underwriterId === currentUserId)
    ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }, [leads, currentUserId])

  const handleSubmitValuation = () => {
    if (!selectedLead || !valuationAmount) return
    
    addValuation(selectedLead.id, {
      leadId: selectedLead.id,
      underwriterId: currentUserId,
      underwriterName: currentUserName,
      valuationAmount: parseFloat(valuationAmount),
      reasoning,
      comps: comps || undefined,
      redFlags: redFlags.length > 0 ? redFlags : undefined
    })
    
    // Reset form
    setSelectedLead(null)
    setValuationAmount('')
    setReasoning('')
    setComps('')
    setRedFlags([])
  }

  const toggleRedFlag = (flag: string) => {
    setRedFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Valuations</h1>
        <p className="text-muted-foreground">Review and value incoming leads</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <ClockIcon className="size-4" />
            Pending ({pendingLeads.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircleIcon className="size-4" />
            My Valuations ({myValuedLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingLeads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircleIcon className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">All caught up!</p>
                <p className="text-muted-foreground text-sm mt-1">No leads waiting for your valuation.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingLeads.map((lead) => {
                const hasOneValuation = lead.status === 'one_valuation'
                
                return (
                  <Card key={lead.id} className={hasOneValuation ? 'border-orange-500/50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {lead.ownerName}
                            {hasOneValuation && (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs">
                                1/2
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Submitted {formatTimeAgo(lead.submittedAt)} by {lead.submittedBy}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{lead.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.propertyCity}, {lead.propertyState} • {lead.propertyCounty} County
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <LandPlotIcon className="size-3.5 text-muted-foreground" />
                          {lead.acreage} acres
                        </span>
                        <span className="text-muted-foreground">APN: {lead.parcelId}</span>
                      </div>
                      {lead.askingPrice && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Asking:</span>{' '}
                          <span className="font-medium">${lead.askingPrice.toLocaleString()}</span>
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          "{lead.notes}"
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <SearchIcon className="size-4 mr-2" />
                        Add Valuation
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {myValuedLeads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You haven't submitted any valuations yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myValuedLeads.map((lead) => {
                const myValuation = lead.valuations.find(v => v.underwriterId === currentUserId)
                
                return (
                  <Card key={lead.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{lead.ownerName}</CardTitle>
                        <Badge variant="outline" className={
                          lead.status === 'valued' 
                            ? 'bg-blue-500/10 text-blue-600' 
                            : 'bg-orange-500/10 text-orange-600'
                        }>
                          {lead.valuations.length}/2 valuations
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-2">
                      <p className="text-sm">
                        {lead.propertyAddress}, {lead.propertyCity}, {lead.propertyState}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.acreage} acres • {lead.propertyCounty} County
                      </p>
                      
                      <div className="pt-2 mt-2 border-t">
                        <p className="text-sm font-medium mb-1">My Valuation</p>
                        <p className="text-lg font-bold text-chart-1">
                          ${myValuation?.valuationAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {myValuation?.reasoning}
                        </p>
                      </div>
                      
                      {lead.status === 'valued' && lead.averageValuation && (
                        <div className="pt-2 mt-2 border-t">
                          <p className="text-sm font-medium">Average Offer</p>
                          <p className="text-xl font-bold text-primary">
                            ${lead.averageValuation.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Valuation Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Valuation</DialogTitle>
            <DialogDescription>
              Review the property details and provide your valuation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6 py-4">
              {/* Property Summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="font-medium">{selectedLead.ownerName}</span>
                    <span className="text-muted-foreground">•</span>
                    <PhoneIcon className="size-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedLead.ownerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedLead.propertyAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLead.propertyCity}, {selectedLead.propertyState} • {selectedLead.propertyCounty} County
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span><strong>{selectedLead.acreage}</strong> acres</span>
                    <span>APN: <strong>{selectedLead.parcelId}</strong></span>
                    {selectedLead.askingPrice && (
                      <span>Asking: <strong>${selectedLead.askingPrice.toLocaleString()}</strong></span>
                    )}
                  </div>
                  {selectedLead.notes && (
                    <p className="text-sm text-muted-foreground italic pt-2 border-t">
                      Notes: "{selectedLead.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Valuation Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valuationAmount">Your Valuation (Offer Amount) *</Label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="valuationAmount"
                      type="number"
                      placeholder="45000"
                      className="pl-9"
                      value={valuationAmount}
                      onChange={(e) => setValuationAmount(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the amount you believe we should offer (typically 50-70% of market value)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasoning">Reasoning *</Label>
                  <Textarea
                    id="reasoning"
                    placeholder="Explain how you arrived at this valuation..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comps">Comparable Sales (optional)</Label>
                  <Textarea
                    id="comps"
                    placeholder="List any comparable sales you found..."
                    value={comps}
                    onChange={(e) => setComps(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Red Flags (if any)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RED_FLAGS.map((flag) => (
                      <div key={flag} className="flex items-center space-x-2">
                        <Checkbox
                          id={flag}
                          checked={redFlags.includes(flag)}
                          onCheckedChange={() => toggleRedFlag(flag)}
                        />
                        <label
                          htmlFor={flag}
                          className="text-sm cursor-pointer"
                        >
                          {flag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitValuation}
              disabled={!valuationAmount || !reasoning}
            >
              <CheckCircleIcon className="size-4 mr-2" />
              Submit Valuation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
