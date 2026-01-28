'use client'

import { useMemo, useState } from 'react'
import {
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
  TrashIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useLeadsStore } from '@/lib/data/store'
import type { Lead } from '@/lib/types'

export default function AdminLeadsPage() {
  const { leads } = useLeadsStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = search === '' || 
        lead.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        lead.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        lead.propertyCounty.toLowerCase().includes(search.toLowerCase()) ||
        lead.parcelId.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      
      return matchesSearch && matchesStatus
    }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }, [leads, search, statusFilter])

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
    pending_valuation: 'Pending Valuation',
    one_valuation: '1/2 Valuations',
    valued: 'Valued',
    offer_made: 'Offer Made',
    call_booked: 'Call Booked',
    closed: 'Closed',
    dead: 'Dead'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Leads</h1>
          <p className="text-muted-foreground">Manage and view all submitted leads</p>
        </div>
        <Button variant="outline">
          <DownloadIcon className="size-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, address, county, or APN..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_valuation">Pending Valuation</SelectItem>
                <SelectItem value="one_valuation">1/2 Valuations</SelectItem>
                <SelectItem value="valued">Valued</SelectItem>
                <SelectItem value="offer_made">Offer Made</SelectItem>
                <SelectItem value="call_booked">Call Booked</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leads found matching your criteria.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Acreage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valuation</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{lead.ownerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{lead.propertyAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.propertyCity}, {lead.propertyState} • {lead.propertyCounty}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.acreage} ac</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.averageValuation ? (
                        <span className="font-medium text-chart-1">
                          ${lead.averageValuation.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(lead.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{selectedLead.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedLead.ownerPhone}</p>
                </div>
              </div>

              {/* Property Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Address</p>
                  <p className="font-medium">{selectedLead.propertyAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLead.propertyCity}, {selectedLead.propertyState}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">County / APN</p>
                  <p className="font-medium">{selectedLead.propertyCounty} County</p>
                  <p className="text-sm text-muted-foreground">{selectedLead.parcelId}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Acreage</p>
                  <p className="font-medium">{selectedLead.acreage} acres</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="font-medium">
                    {selectedLead.askingPrice 
                      ? `$${selectedLead.askingPrice.toLocaleString()}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedLead.status]}>
                    {statusLabels[selectedLead.status]}
                  </Badge>
                </div>
              </div>

              {/* Valuations */}
              {selectedLead.valuations.length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-3">Valuations</p>
                  <div className="space-y-3">
                    {selectedLead.valuations.map((v) => (
                      <div key={v.id} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{v.underwriterName}</p>
                          <p className="font-bold text-chart-1">
                            ${v.valuationAmount.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{v.reasoning}</p>
                        {v.redFlags && v.redFlags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {v.redFlags.map((flag) => (
                              <Badge key={flag} variant="outline" className="text-xs text-destructive">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedLead.averageValuation && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-center justify-between">
                      <p className="font-medium">Average Offer</p>
                      <p className="text-xl font-bold text-primary">
                        ${selectedLead.averageValuation.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{selectedLead.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4 text-sm text-muted-foreground">
                <p>Submitted by {selectedLead.submittedBy} on {formatDate(selectedLead.submittedAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
