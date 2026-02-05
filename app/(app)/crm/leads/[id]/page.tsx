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
  MessageSquareIcon,
  StickyNoteIcon,
  ActivityIcon,
  StarIcon,
  FlameIcon,
  MoreHorizontalIcon,
  CopyIcon,
  TrashIcon,
  MapIcon,
  PencilIcon,
  CheckSquareIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LandPlotIcon,
  DollarSignIcon,
  UserIcon,
  BuildingIcon,
  CalculatorIcon,
  ExternalLinkIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'

import { StageSelector } from '@/components/crm/stage-selector'
import { ActivityTimeline } from '@/components/crm/activity-timeline'
import { CompFormDialog } from '@/components/crm/comp-form-dialog'

import { useCRMStore } from '@/lib/data/crm-store'
import { useUserStore } from '@/lib/data/store'
import { PIPELINE_STAGES, LEAD_SOURCES } from '@/lib/types/crm'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  
  const { currentLead, leadsLoading, fetchLead, updateLead, deleteLead, addNote, sendSMS, logCall } = useCRMStore()
  const { currentUserId, currentUserName } = useUserStore()
  const { toast } = useToast()
  
  // Collapsible states
  const [tasksOpen, setTasksOpen] = useState(true)
  const [leadInfoOpen, setLeadInfoOpen] = useState(true)
  const [propertyInfoOpen, setPropertyInfoOpen] = useState(true)
  const [financialOpen, setFinancialOpen] = useState(false)
  const [compsOpen, setCompsOpen] = useState(false)
  
  // Dialog states
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [smsDialogOpen, setSmsDialogOpen] = useState(false)
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [smsContent, setSmsContent] = useState('')
  const [callNotes, setCallNotes] = useState('')
  const [callOutcome, setCallOutcome] = useState('')

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

  const handleAddNote = async () => {
    if (!currentLead || !noteContent.trim()) return
    try {
      await addNote(currentLead.id, noteContent, currentUserId, currentUserName)
      setNoteContent('')
      setNoteDialogOpen(false)
      await fetchLead(leadId)
      toast({ title: 'Note Added', description: 'Your note has been saved.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to add note.', variant: 'destructive' })
    }
  }

  const handleSendSMS = async () => {
    if (!currentLead || !smsContent.trim()) return
    try {
      await sendSMS(currentLead.id, currentLead.owner_phone, smsContent, currentUserId, currentUserName)
      setSmsContent('')
      setSmsDialogOpen(false)
      await fetchLead(leadId)
      toast({ title: 'SMS Sent', description: 'Your message has been sent.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to send SMS.', variant: 'destructive' })
    }
  }

  const handleLogCall = async () => {
    if (!currentLead) return
    try {
      await logCall(currentLead.id, { body: callNotes, call_outcome: callOutcome }, currentUserId, currentUserName)
      setCallNotes('')
      setCallOutcome('')
      setCallDialogOpen(false)
      await fetchLead(leadId)
      toast({ title: 'Call Logged', description: 'Your call has been recorded.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to log call.', variant: 'destructive' })
    }
  }

  if (leadsLoading || !currentLead) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-4 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <div className="col-span-8">
            <Skeleton className="h-full" />
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        {/* Left: Back, Name, Status */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/crm/leads">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {lead.owner_first_name} {lead.owner_last_name}
            </h1>
            {lead.is_hot && <FlameIcon className="size-5 text-orange-500" />}
            {lead.is_starred && <StarIcon className="size-5 text-yellow-500 fill-yellow-500" />}
            
            <StageSelector
              leadId={lead.id}
              currentStage={lead.stage}
              userId={currentUserId}
              userName={currentUserName}
            />
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Note */}
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <StickyNoteIcon className="size-4 mr-2" />
                Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
                <DialogDescription>Add a note to this lead's timeline.</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNote} disabled={!noteContent.trim()}>Add Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Email */}
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${lead.owner_email || ''}`}>
              <MailIcon className="size-4 mr-2" />
              Email
            </a>
          </Button>

          {/* SMS */}
          <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquareIcon className="size-4 mr-2" />
                SMS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send SMS</DialogTitle>
                <DialogDescription>Send a text message to {lead.owner_phone}</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Type your message..."
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSmsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendSMS} disabled={!smsContent.trim()}>Send SMS</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Call */}
          <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PhoneIcon className="size-4 mr-2" />
                Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Call</DialogTitle>
                <DialogDescription>Record a call with {lead.owner_first_name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Call Outcome</label>
                  <Input
                    placeholder="e.g., Left voicemail, Spoke with owner, No answer"
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="What was discussed?"
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleLogCall}>Log Call</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Activity - scroll to bottom */}
          <Button variant="outline" size="sm" onClick={() => {
            const timeline = document.getElementById('activity-timeline')
            if (timeline) timeline.scrollTop = 0
          }}>
            <ActivityIcon className="size-4 mr-2" />
            Activity
          </Button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleStar}>
                <StarIcon className="size-4 mr-2" />
                {lead.is_starred ? 'Unstar Lead' : 'Star Lead'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleHot}>
                <FlameIcon className="size-4 mr-2" />
                {lead.is_hot ? 'Remove Hot' : 'Mark as Hot'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/crm/leads/${lead.id}/edit`}>
                  <PencilIcon className="size-4 mr-2" />
                  Edit Lead
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(lead.owner_phone, 'Phone')}>
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
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <TrashIcon className="size-4 mr-2" />
                    Delete Lead
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this lead and all associated data.
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

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Sidebar - Scrollable */}
        <ScrollArea className="col-span-4 h-full pr-4">
          <div className="space-y-3">
            {/* Tasks Section */}
            <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquareIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        {lead.tasks && lead.tasks.length > 0 && (
                          <Badge variant="secondary" className="text-xs">{lead.tasks.filter(t => !t.is_completed).length}</Badge>
                        )}
                      </div>
                      {tasksOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3 px-4">
                    {(!lead.tasks || lead.tasks.length === 0) ? (
                      <p className="text-sm text-muted-foreground">No tasks yet</p>
                    ) : (
                      <div className="space-y-2">
                        {lead.tasks.filter(t => !t.is_completed).map((task) => (
                          <div key={task.id} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-1" />
                            <div>
                              <p>{task.title}</p>
                              {task.due_date && (
                                <p className="text-xs text-muted-foreground">
                                  Due {format(new Date(task.due_date), 'MMM d')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                      <PlusIcon className="size-3 mr-1" /> Add Task
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Lead Information */}
            <Collapsible open={leadInfoOpen} onOpenChange={setLeadInfoOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Lead Information</CardTitle>
                      </div>
                      {leadInfoOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3 px-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Name</p>
                        <p className="font-medium">{lead.owner_first_name} {lead.owner_last_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Source</p>
                        <p className="font-medium">{sourceConfig.label}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Phone</p>
                        <div className="flex items-center gap-1">
                          <a href={`tel:${lead.owner_phone}`} className="font-medium hover:text-primary">
                            {lead.owner_phone}
                          </a>
                          <Button variant="ghost" size="icon" className="size-5" onClick={() => copyToClipboard(lead.owner_phone, 'Phone')}>
                            <CopyIcon className="size-3" />
                          </Button>
                        </div>
                      </div>
                      {lead.owner_email && (
                        <div>
                          <p className="text-muted-foreground text-xs">Email</p>
                          <a href={`mailto:${lead.owner_email}`} className="font-medium hover:text-primary text-sm truncate block">
                            {lead.owner_email}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground text-xs">Created</p>
                        <p className="font-medium">{format(new Date(lead.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      {lead.last_contacted_at && (
                        <div>
                          <p className="text-muted-foreground text-xs">Last Contact</p>
                          <p className="font-medium">{formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}</p>
                        </div>
                      )}
                    </div>
                    {lead.mailing_address && (
                      <div className="text-sm pt-2 border-t">
                        <p className="text-muted-foreground text-xs">Mailing Address</p>
                        <p className="font-medium">
                          {lead.mailing_address}, {lead.mailing_city}, {lead.mailing_state} {lead.mailing_zip}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Property Information */}
            <Collapsible open={propertyInfoOpen} onOpenChange={setPropertyInfoOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LandPlotIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Property Information</CardTitle>
                      </div>
                      {propertyInfoOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3 px-4 space-y-3">
                    <div className="text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs">Address</p>
                          <p className="font-medium">{lead.property_address}</p>
                          <p className="text-muted-foreground">{lead.property_city}, {lead.property_state} {lead.property_zip}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon className="size-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">County</p>
                        <p className="font-medium">{lead.property_county}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Acreage</p>
                        <p className="font-medium">{lead.acreage} acres</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">APN</p>
                        <p className="font-medium font-mono text-xs">{lead.apn}</p>
                      </div>
                      {lead.zoning && (
                        <div>
                          <p className="text-muted-foreground text-xs">Zoning</p>
                          <p className="font-medium">{lead.zoning}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Financial Information */}
            <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSignIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Financial</CardTitle>
                        {lead.offer_price && (
                          <Badge variant="secondary" className="text-xs text-green-600">${lead.offer_price.toLocaleString()}</Badge>
                        )}
                      </div>
                      {financialOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3 px-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {lead.asking_price && (
                        <div>
                          <p className="text-muted-foreground text-xs">Asking Price</p>
                          <p className="font-medium">${lead.asking_price.toLocaleString()}</p>
                        </div>
                      )}
                      {lead.offer_price && (
                        <div>
                          <p className="text-muted-foreground text-xs">Our Offer</p>
                          <p className="font-medium text-green-600">${lead.offer_price.toLocaleString()}</p>
                        </div>
                      )}
                      {lead.market_value && (
                        <div>
                          <p className="text-muted-foreground text-xs">Market Value</p>
                          <p className="font-medium">${lead.market_value.toLocaleString()}</p>
                        </div>
                      )}
                      {lead.average_comp_value && (
                        <div>
                          <p className="text-muted-foreground text-xs">Avg Comp Value</p>
                          <p className="font-medium text-blue-600">${lead.average_comp_value.toLocaleString()}</p>
                        </div>
                      )}
                      {lead.tax_assessed_value && (
                        <div>
                          <p className="text-muted-foreground text-xs">Tax Assessed</p>
                          <p className="font-medium">${lead.tax_assessed_value.toLocaleString()}</p>
                        </div>
                      )}
                      {lead.annual_taxes && (
                        <div>
                          <p className="text-muted-foreground text-xs">Annual Taxes</p>
                          <p className="font-medium">${lead.annual_taxes.toLocaleString()}/yr</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Comps */}
            <Collapsible open={compsOpen} onOpenChange={setCompsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalculatorIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Comps</CardTitle>
                        {lead.comps && lead.comps.length > 0 && (
                          <Badge variant="secondary" className="text-xs">{lead.comps.length}</Badge>
                        )}
                      </div>
                      {compsOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-3 px-4">
                    {(!lead.comps || lead.comps.length === 0) ? (
                      <p className="text-sm text-muted-foreground">No comps submitted</p>
                    ) : (
                      <div className="space-y-2">
                        {lead.comps.map((comp) => (
                          <div key={comp.id} className="p-2 bg-muted/50 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{comp.comper_name}</span>
                              <span className="font-semibold text-green-600">${comp.comp_value.toLocaleString()}</span>
                            </div>
                            {comp.confidence_level && (
                              <Badge variant="outline" className="text-xs mt-1">{comp.confidence_level}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <CompFormDialog
                      leadId={lead.id}
                      propertyAcreage={lead.acreage}
                      userId={currentUserId}
                      userName={currentUserName}
                    >
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                        <PlusIcon className="size-3 mr-1" /> Add Comp
                      </Button>
                    </CompFormDialog>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Right Side - Activity Timeline */}
        <div className="col-span-8 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3 px-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Activity</CardTitle>
                <span className="text-xs text-muted-foreground">{lead.activities_count} activities</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea id="activity-timeline" className="h-full">
                <div className="p-4">
                  <ActivityTimeline activities={lead.activities || []} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
