'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  SendIcon,
  PhoneIcon,
  MapPinIcon,
  LandPlotIcon,
  DollarSignIcon,
  UserIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLeadsStore, useUserStore } from '@/lib/data/store'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function LeadsPage() {
  const { leads, addLead, updateLeadStatus } = useLeadsStore()
  const { currentUserId, currentUserName } = useUserStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyCounty: '',
    parcelId: '',
    acreage: '',
    askingPrice: '',
    notes: ''
  })

  // My leads (submitted by current user or all if admin)
  const myLeads = useMemo(() => {
    return [...leads]
      .filter(l => l.submittedBy === currentUserId || currentUserId === 'admin-1')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }, [leads, currentUserId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addLead({
      submittedBy: currentUserName,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      propertyAddress: formData.propertyAddress,
      propertyCity: formData.propertyCity,
      propertyState: formData.propertyState,
      propertyCounty: formData.propertyCounty,
      parcelId: formData.parcelId,
      acreage: parseFloat(formData.acreage) || 0,
      askingPrice: formData.askingPrice ? parseFloat(formData.askingPrice) : undefined,
      notes: formData.notes || undefined
    })
    
    // Reset form
    setFormData({
      ownerName: '',
      ownerPhone: '',
      propertyAddress: '',
      propertyCity: '',
      propertyState: '',
      propertyCounty: '',
      parcelId: '',
      acreage: '',
      askingPrice: '',
      notes: ''
    })
    
    setIsDialogOpen(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusColors: Record<string, string> = {
    pending_valuation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    one_valuation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    valued: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    offer_made: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    call_booked: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    closed: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    dead: 'bg-muted text-muted-foreground border-border'
  }

  const statusLabels: Record<string, string> = {
    pending_valuation: 'Awaiting Valuation',
    one_valuation: '1 of 2 Valuations',
    valued: 'Valued - Ready for Offer',
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
          <h1 className="text-2xl font-bold tracking-tight">Submit Lead</h1>
          <p className="text-muted-foreground">Add new interested sellers to the pipeline</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="size-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit New Lead</DialogTitle>
              <DialogDescription>
                Enter the property and owner details. The lead will be sent to underwriters for valuation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                {/* Owner Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <UserIcon className="size-4" />
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        placeholder="John Smith"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerPhone">Phone Number *</Label>
                      <Input
                        id="ownerPhone"
                        placeholder="(555) 123-4567"
                        value={formData.ownerPhone}
                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPinIcon className="size-4" />
                    Property Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Input
                      id="propertyAddress"
                      placeholder="123 Rural Road"
                      value={formData.propertyAddress}
                      onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyCity">City *</Label>
                      <Input
                        id="propertyCity"
                        placeholder="Smalltown"
                        value={formData.propertyCity}
                        onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyState">State *</Label>
                      <Select 
                        value={formData.propertyState} 
                        onValueChange={(value) => setFormData({ ...formData, propertyState: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyCounty">County *</Label>
                      <Input
                        id="propertyCounty"
                        placeholder="Example County"
                        value={formData.propertyCounty}
                        onChange={(e) => setFormData({ ...formData, propertyCounty: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <LandPlotIcon className="size-4" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parcelId">Parcel ID / APN *</Label>
                      <Input
                        id="parcelId"
                        placeholder="123-45-678"
                        value={formData.parcelId}
                        onChange={(e) => setFormData({ ...formData, parcelId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acreage">Acreage *</Label>
                      <Input
                        id="acreage"
                        type="number"
                        step="0.01"
                        placeholder="2.5"
                        value={formData.acreage}
                        onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="askingPrice">Asking Price (optional)</Label>
                      <Input
                        id="askingPrice"
                        type="number"
                        placeholder="50000"
                        value={formData.askingPrice}
                        onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about the seller or property..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <SendIcon className="size-4 mr-2" />
                  Submit Lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Leads */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Leads</h2>
        
        {myLeads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No leads submitted yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Click "New Lead" to submit your first lead.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myLeads.map((lead) => (
              <Card key={lead.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{lead.ownerName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <PhoneIcon className="size-3" />
                        {lead.ownerPhone}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[lead.status]} variant="outline">
                      {statusLabels[lead.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Property:</span>{' '}
                    {lead.propertyAddress}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Location:</span>{' '}
                    {lead.propertyCity}, {lead.propertyState} ({lead.propertyCounty} County)
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Acreage:</span>{' '}
                    {lead.acreage} acres
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">APN:</span>{' '}
                    {lead.parcelId}
                  </p>
                  
                  {/* Valuation info */}
                  {lead.valuations.length > 0 && (
                    <div className="pt-2 mt-2 border-t space-y-1">
                      <p className="text-sm font-medium">Valuations ({lead.valuations.length}/2)</p>
                      {lead.valuations.map((v) => (
                        <p key={v.id} className="text-sm text-muted-foreground">
                          {v.underwriterName}: ${v.valuationAmount.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Average valuation */}
                  {lead.averageValuation && lead.status === 'valued' && (
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Offer Amount</p>
                        <p className="text-lg font-bold text-chart-1">
                          ${lead.averageValuation.toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => copyToClipboard(`$${lead.averageValuation?.toLocaleString()}`, lead.id)}
                      >
                        {copied === lead.id ? (
                          <>
                            <CheckIcon className="size-3 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon className="size-3 mr-2" />
                            Copy Offer Amount
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                {/* Actions based on status */}
                {lead.status === 'valued' && (
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Open cal.com booking link
                        window.open('https://cal.com/landhud', '_blank')
                        updateLeadStatus(lead.id, 'call_booked')
                      }}
                    >
                      <ExternalLinkIcon className="size-4 mr-2" />
                      Book Call with Taijaun
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
