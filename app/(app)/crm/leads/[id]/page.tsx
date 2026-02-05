'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeftIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  LandPlotIcon,
  StarIcon,
  FlameIcon,
  MoreHorizontalIcon,
  ExternalLinkIcon,
  CopyIcon,
  TrashIcon,
  MapIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  CalculatorIcon,
  PencilIcon,
  PlusIcon,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

import { StageSelector, StageProgressBar } from '@/components/crm/stage-selector'
import { ActivityTimeline } from '@/components/crm/activity-timeline'
import { CommunicationPanel } from '@/components/crm/communication-panel'
import { NotesSection } from '@/components/crm/notes-section'
import { CompFormDialog } from '@/components/crm/comp-form-dialog'

import { useCRMStore } from '@/lib/data/crm-store'
import { useUserStore } from '@/lib/data/store'
import { PIPELINE_STAGES, LEAD_SOURCES } from '@/lib/types/crm'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  
  const { currentLead, leadsLoading, fetchLead, updateLead, deleteLead } = useCRMStore()
  const { currentUserId, currentUserName } = useUserStore()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId)
    }
  }, [leadId, fetchLead])

  const toggleStar = async () => {
    if (!currentLead) return
    await updateLead(currentLead.id, { is_starred: !currentLead.is_starred })
    await fetchLead(leadId)
  }

  const toggleHot = async () => {
    if (!currentLead) return
    await updateLead(currentLead.id, { is_hot: !currentLead.is_hot })
    await fetchLead(leadId)
  }

  const handleDelete = async () => {
    if (!currentLead) return
    await deleteLead(currentLead.id)
    toast({
      title: 'Lead Deleted',
      description: 'The lead has been permanently deleted.',
    })
    router.push('/crm/leads')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    })
  }

  if (leadsLoading || !currentLead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  const lead = currentLead
  const stageConfig = PIPELINE_STAGES[lead.stage]
  const sourceConfig = LEAD_SOURCES[lead.source]
  
  const googleMapsUrl = lead.latitude && lead.longitude
    ? `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${lead.property_address}, ${lead.property_city}, ${lead.property_state}`)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/crm/leads">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {lead.owner_first_name} {lead.owner_last_name}
              </h1>
              {lead.is_hot && <FlameIcon className="size-5 text-orange-500" />}
              {lead.is_starred && <StarIcon className="size-5 text-yellow-500 fill-yellow-500" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPinIcon className="size-4" />
              <span>{lead.property_address}, {lead.property_city}, {lead.property_state}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StageSelector
            leadId={lead.id}
            currentStage={lead.stage}
            userId={currentUserId}
            userName={currentUserName}
          />
          <Button variant="outline" size="icon" onClick={toggleStar}>
            <StarIcon className={`size-4 ${lead.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleHot}>
            <FlameIcon className={`size-4 ${lead.is_hot ? 'text-orange-500' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/crm/leads/${lead.id}/edit`}>
                  <PencilIcon className="size-4 mr-2" />
                  Edit Lead
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(lead.owner_phone, 'Phone number')}>
                <CopyIcon className="size-4 mr-2" />
                Copy Phone
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapIcon className="size-4 mr-2" />
                  View on Map
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete Lead
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this lead and all associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <StageProgressBar currentStage={lead.stage} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="comps">Comps ({lead.comps?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Owner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{lead.owner_first_name} {lead.owner_last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${lead.owner_phone}`} className="font-medium hover:text-primary">
                          {lead.owner_phone}
                        </a>
                        <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(lead.owner_phone, 'Phone')}>
                          <CopyIcon className="size-3" />
                        </Button>
                      </div>
                      {lead.owner_phone_2 && (
                        <p className="text-sm text-muted-foreground mt-1">{lead.owner_phone_2}</p>
                      )}
                    </div>
                    {lead.owner_email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${lead.owner_email}`} className="font-medium hover:text-primary">
                          {lead.owner_email}
                        </a>
                      </div>
                    )}
                    {lead.mailing_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mailing Address</p>
                        <p className="font-medium">
                          {lead.mailing_address}<br />
                          {lead.mailing_city}, {lead.mailing_state} {lead.mailing_zip}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Property Information</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapIcon className="size-4 mr-2" />
                        View on Map
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Address</p>
                      <p className="font-medium">
                        {lead.property_address}<br />
                        {lead.property_city}, {lead.property_state} {lead.property_zip}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">County</p>
                      <p className="font-medium">{lead.property_county}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">APN</p>
                      <p className="font-medium font-mono">{lead.apn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Acreage</p>
                      <p className="font-medium">{lead.acreage} acres</p>
                    </div>
                    {lead.zoning && (
                      <div>
                        <p className="text-sm text-muted-foreground">Zoning</p>
                        <p className="font-medium">{lead.zoning}</p>
                      </div>
                    )}
                    {lead.land_use && (
                      <div>
                        <p className="text-sm text-muted-foreground">Land Use</p>
                        <p className="font-medium">{lead.land_use}</p>
                      </div>
                    )}
                  </div>
                  {lead.legal_description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Legal Description</p>
                      <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                        {lead.legal_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {lead.asking_price && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Asking Price</p>
                        <p className="text-lg font-semibold">${lead.asking_price.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.offer_price && (
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <p className="text-sm text-muted-foreground">Our Offer</p>
                        <p className="text-lg font-semibold text-green-600">${lead.offer_price.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.market_value && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Market Value</p>
                        <p className="text-lg font-semibold">${lead.market_value.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.average_comp_value && (
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <p className="text-sm text-muted-foreground">Avg Comp Value</p>
                        <p className="text-lg font-semibold text-blue-600">${lead.average_comp_value.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.tax_assessed_value && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Tax Assessed</p>
                        <p className="text-lg font-semibold">${lead.tax_assessed_value.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.annual_taxes && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Annual Taxes</p>
                        <p className="text-lg font-semibold">${lead.annual_taxes.toLocaleString()}/yr</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                  <CardDescription>All actions and updates for this lead</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={lead.activities || []} maxHeight="600px" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communications</CardTitle>
                  <CardDescription>SMS, calls, and emails</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommunicationPanel
                    lead={lead}
                    communications={lead.communications || []}
                    userId={currentUserId}
                    userName={currentUserName}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comps" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Property Comps</CardTitle>
                      <CardDescription>Valuations from underwriters</CardDescription>
                    </div>
                    <CompFormDialog
                      leadId={lead.id}
                      propertyAcreage={lead.acreage}
                      userId={currentUserId}
                      userName={currentUserName}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {(!lead.comps || lead.comps.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalculatorIcon className="size-8 mx-auto mb-2 opacity-50" />
                      <p>No comps yet</p>
                      <p className="text-sm">Add valuations from underwriters</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      {lead.comps.length > 1 && (
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                          <p className="text-sm font-medium text-blue-600 mb-2">
                            {lead.comps.length} Valuations Submitted
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Low</p>
                              <p className="font-semibold">
                                ${Math.min(...lead.comps.map(c => c.comp_value)).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Average</p>
                              <p className="font-semibold text-blue-600">
                                ${Math.round(lead.comps.reduce((sum, c) => sum + c.comp_value, 0) / lead.comps.length).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">High</p>
                              <p className="font-semibold">
                                ${Math.max(...lead.comps.map(c => c.comp_value)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Individual Comps */}
                      {lead.comps.map((comp) => (
                        <div key={comp.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{comp.comper_name}</p>
                              <p className="text-2xl font-bold text-green-600">
                                ${comp.comp_value.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {comp.confidence_level && (
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      comp.confidence_level === 'high' ? 'border-green-500 text-green-600' :
                                      comp.confidence_level === 'medium' ? 'border-yellow-500 text-yellow-600' :
                                      'border-gray-500 text-gray-600'
                                    }
                                  >
                                    {comp.confidence_level} confidence
                                  </Badge>
                                )}
                                {comp.methodology && (
                                  <span className="text-xs text-muted-foreground">
                                    {comp.methodology}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(comp.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>

                          {/* Comparable Sales */}
                          {comp.comparable_sales && comp.comparable_sales.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Comparable Sales Used:</p>
                              <div className="space-y-2">
                                {comp.comparable_sales.map((sale, index) => (
                                  <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium">{sale.address}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                          <span>{sale.acreage} acres</span>
                                          <span>Sold {format(new Date(sale.sale_date), 'MMM yyyy')}</span>
                                          {sale.distance_miles && (
                                            <span>{sale.distance_miles} mi away</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold">${sale.sale_price.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${sale.price_per_acre.toLocaleString()}/acre
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {comp.notes && (
                            <p className="text-sm text-muted-foreground border-t pt-3">
                              {comp.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Quick Info & Notes */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stage</span>
                <Badge className={`${stageConfig.bgColor} ${stageConfig.color} border-0`}>
                  {stageConfig.label}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium">{sourceConfig.label}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {lead.last_contacted_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Contact</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}
                    </span>
                  </div>
                </>
              )}
              {lead.next_follow_up_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Follow-up</span>
                    <span className="text-sm font-medium">
                      {format(new Date(lead.next_follow_up_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activities</span>
                <span className="text-sm font-medium">{lead.activities_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notes</span>
                <span className="text-sm font-medium">{lead.notes_count}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                leadId={lead.id}
                notes={lead.notes || []}
                userId={currentUserId}
                userName={currentUserName}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
