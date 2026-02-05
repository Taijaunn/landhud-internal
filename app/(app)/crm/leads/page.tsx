'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  SlidersHorizontalIcon,
  LayoutGridIcon,
  ListIcon,
  XIcon,
  ArrowUpDownIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import { LeadCard } from '@/components/crm/lead-card'
import { StageBadge } from '@/components/crm/stage-selector'

import { useCRMStore } from '@/lib/data/crm-store'
import { useUserStore } from '@/lib/data/store'
import { PIPELINE_STAGES, LEAD_SOURCES, type PipelineStage, type LeadSource, type CRMLead } from '@/lib/types/crm'

// Wrapper with Suspense for useSearchParams
export default function CRMLeadsPage() {
  return (
    <Suspense fallback={<CRMLeadsPageSkeleton />}>
      <CRMLeadsPageContent />
    </Suspense>
  )
}

function CRMLeadsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function CRMLeadsPageContent() {
  const searchParams = useSearchParams()
  const { 
    leads, 
    leadsLoading, 
    filters, 
    setFilters, 
    clearFilters, 
    fetchLeads,
    sortBy,
    setSortBy,
  } = useCRMStore()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Initialize filters from URL params
  useEffect(() => {
    const stageParam = searchParams.get('stage')
    const hotParam = searchParams.get('is_hot')
    
    const initialFilters: typeof filters = {}
    
    if (stageParam && Object.keys(PIPELINE_STAGES).includes(stageParam)) {
      initialFilters.stage = [stageParam as PipelineStage]
    }
    if (hotParam === 'true') {
      initialFilters.is_hot = true
    }
    
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
    }
  }, [searchParams, setFilters])

  // Fetch leads when filters change
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads, filters, sortBy])

  // Apply search filter locally
  const filteredLeads = searchQuery
    ? leads.filter(lead => 
        `${lead.owner_first_name} ${lead.owner_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.property_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.owner_phone.includes(searchQuery) ||
        lead.apn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leads

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length

  const handleStageFilter = (stage: PipelineStage, checked: boolean) => {
    const currentStages = filters.stage || []
    if (checked) {
      setFilters({ ...filters, stage: [...currentStages, stage] })
    } else {
      setFilters({ ...filters, stage: currentStages.filter(s => s !== stage) })
    }
  }

  const handleSourceFilter = (source: LeadSource, checked: boolean) => {
    const currentSources = filters.source || []
    if (checked) {
      setFilters({ ...filters, source: [...currentSources, source] })
    } else {
      setFilters({ ...filters, source: currentSources.filter(s => s !== source) })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
            {activeFilterCount > 0 && ` (filtered)`}
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/leads/new">
            <PlusIcon className="size-4 mr-2" />
            Add Lead
          </Link>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, address, or APN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              {/* Stage Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Stage
                    {filters.stage?.length ? (
                      <Badge variant="secondary" className="ml-2 px-1.5">
                        {filters.stage.length}
                      </Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stage) => (
                    <DropdownMenuCheckboxItem
                      key={stage}
                      checked={filters.stage?.includes(stage)}
                      onCheckedChange={(checked) => handleStageFilter(stage, checked)}
                    >
                      {PIPELINE_STAGES[stage].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Source Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Source
                    {filters.source?.length ? (
                      <Badge variant="secondary" className="ml-2 px-1.5">
                        {filters.source.length}
                      </Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(LEAD_SOURCES) as LeadSource[]).map((source) => (
                    <DropdownMenuCheckboxItem
                      key={source}
                      checked={filters.source?.includes(source)}
                      onCheckedChange={(checked) => handleSourceFilter(source, checked)}
                    >
                      {LEAD_SOURCES[source].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Filters Sheet */}
              <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontalIcon className="size-4 mr-2" />
                    More Filters
                    {activeFilterCount > 2 && (
                      <Badge variant="secondary" className="ml-2 px-1.5">
                        {activeFilterCount - 2}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Leads</SheetTitle>
                    <SheetDescription>
                      Narrow down your lead list
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label>Hot Leads Only</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="is_hot"
                          checked={filters.is_hot === true}
                          onCheckedChange={(checked) => 
                            setFilters({ ...filters, is_hot: checked ? true : undefined })
                          }
                        />
                        <Label htmlFor="is_hot" className="font-normal">
                          Show only hot leads
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Starred Only</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="is_starred"
                          checked={filters.is_starred === true}
                          onCheckedChange={(checked) => 
                            setFilters({ ...filters, is_starred: checked ? true : undefined })
                          }
                        />
                        <Label htmlFor="is_starred" className="font-normal">
                          Show only starred leads
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Acreage Range</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.min_acreage || ''}
                          onChange={(e) => 
                            setFilters({ ...filters, min_acreage: e.target.value ? Number(e.target.value) : undefined })
                          }
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.max_acreage || ''}
                          onChange={(e) => 
                            setFilters({ ...filters, max_acreage: e.target.value ? Number(e.target.value) : undefined })
                          }
                        />
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        clearFilters()
                        setFilterSheetOpen(false)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select
                value={`${sortBy.field}-${sortBy.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [keyof CRMLead, 'asc' | 'desc']
                  setSortBy(field, direction)
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDownIcon className="size-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="owner_last_name-asc">Name A-Z</SelectItem>
                  <SelectItem value="owner_last_name-desc">Name Z-A</SelectItem>
                  <SelectItem value="acreage-desc">Largest Acreage</SelectItem>
                  <SelectItem value="acreage-asc">Smallest Acreage</SelectItem>
                  <SelectItem value="offer_price-desc">Highest Price</SelectItem>
                  <SelectItem value="offer_price-asc">Lowest Price</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGridIcon className="size-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {filters.stage?.map((stage) => (
                <Badge key={stage} variant="secondary" className="gap-1">
                  {PIPELINE_STAGES[stage].label}
                  <button
                    onClick={() => handleStageFilter(stage, false)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
              {filters.source?.map((source) => (
                <Badge key={source} variant="secondary" className="gap-1">
                  {LEAD_SOURCES[source].label}
                  <button
                    onClick={() => handleSourceFilter(source, false)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
              {filters.is_hot && (
                <Badge variant="secondary" className="gap-1">
                  Hot Leads
                  <button
                    onClick={() => setFilters({ ...filters, is_hot: undefined })}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.is_starred && (
                <Badge variant="secondary" className="gap-1">
                  Starred
                  <button
                    onClick={() => setFilters({ ...filters, is_starred: undefined })}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Grid/List */}
      {leadsLoading ? (
        <div className={viewMode === 'grid' 
          ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <SearchIcon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {activeFilterCount > 0 || searchQuery
                ? 'Try adjusting your filters or search query'
                : 'Get started by adding your first lead'}
            </p>
            {activeFilterCount > 0 || searchQuery ? (
              <Button variant="outline" onClick={() => {
                clearFilters()
                setSearchQuery('')
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/crm/leads/new">
                  <PlusIcon className="size-4 mr-2" />
                  Add Lead
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} compact={viewMode === 'list'} />
          ))}
        </div>
      )}
    </div>
  )
}
