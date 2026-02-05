'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CalculatorIcon,
  SearchIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

import { supabase } from '@/lib/supabase'
import type { CRMComp, CRMLead } from '@/lib/types/crm'

interface CompWithLead extends CRMComp {
  lead?: Pick<CRMLead, 'id' | 'owner_first_name' | 'owner_last_name' | 'property_address' | 'property_city' | 'property_state' | 'acreage'>
}

export default function CRMCompsPage() {
  const [comps, setComps] = useState<CompWithLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'comp_value'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchComps()
  }, [sortBy, sortOrder])

  const fetchComps = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('crm_comps')
        .select(`
          *,
          lead:crm_leads(id, owner_first_name, owner_last_name, property_address, property_city, property_state, acreage)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(100)

      if (error) throw error
      setComps(data || [])
    } catch (error) {
      console.error('Error fetching comps:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComps = searchQuery
    ? comps.filter(comp => 
        comp.comper_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.lead?.property_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${comp.lead?.owner_first_name} ${comp.lead?.owner_last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comps

  // Calculate stats
  const totalComps = comps.length
  const avgValue = comps.length > 0
    ? comps.reduce((sum, c) => sum + c.comp_value, 0) / comps.length
    : 0
  const uniqueCompers = new Set(comps.map(c => c.comper_id)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comps</h1>
        <p className="text-muted-foreground">Property valuations from underwriters</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalComps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Compers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{uniqueCompers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by comper, property, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-') as ['created_at' | 'comp_value', 'asc' | 'desc']
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <ArrowUpDownIcon className="size-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="comp_value-desc">Highest Value</SelectItem>
                <SelectItem value="comp_value-asc">Lowest Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comps Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredComps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalculatorIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No comps found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'Try adjusting your search' : 'Comps will appear here when added to leads'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property / Owner</TableHead>
                  <TableHead>Comper</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComps.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell>
                      {comp.lead ? (
                        <div>
                          <p className="font-medium">
                            {comp.lead.owner_first_name} {comp.lead.owner_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {comp.lead.property_address}, {comp.lead.property_city}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comp.lead.acreage} acres
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown lead</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{comp.comper_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-green-600">
                        ${comp.comp_value.toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      {comp.confidence_level && (
                        <Badge variant="outline" className={
                          comp.confidence_level === 'high' ? 'border-green-500 text-green-600' :
                          comp.confidence_level === 'medium' ? 'border-yellow-500 text-yellow-600' :
                          'border-gray-500 text-gray-600'
                        }>
                          {comp.confidence_level}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(comp.created_at), 'MMM d, yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      {comp.lead && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/crm/leads/${comp.lead.id}`}>
                            <ExternalLinkIcon className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
