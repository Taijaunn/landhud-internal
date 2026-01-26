'use client'

import { useState } from 'react'
import {
  MessageSquareIcon,
  MessageSquareTextIcon,
  UsersIcon,
  FlameIcon,
  CalendarIcon,
  ClockIcon,
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  SendIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useEODStore, useUserStore } from '@/lib/data/store'

const COUNTIES = [
  'Heard County, GA',
  'Mohave County, AZ',
  'Cochise County, AZ',
  'La Paz County, AZ',
  'Costilla County, CO',
  'Hudspeth County, TX',
  'Culberson County, TX',
  'Other'
]

const RED_FLAGS_OPTIONS = [
  'Landlocked properties',
  'Wetlands/flood zones',
  'HOA restrictions',
  'Access issues',
  'Title problems',
  'Environmental concerns',
  'Zoning restrictions'
]

export default function EODReportPage() {
  const { currentRole, currentUserName } = useUserStore()
  const { addSMSReport, addUnderwriterReport, smsReports, underwriterReports } = useEODStore()
  
  const [submitted, setSubmitted] = useState(false)
  
  // SMS VA Form State
  const [smsForm, setSmsForm] = useState({
    textsSent: '',
    textsReceived: '',
    leadsGenerated: '',
    hotLeads: '',
    callsBooked: '',
    challenges: '',
    notes: ''
  })
  
  // Underwriter Form State
  const [uwForm, setUwForm] = useState({
    propertiesResearched: '',
    propertiesApproved: '',
    propertiesRejected: '',
    avgTimePerComp: '',
    hoursWorked: '',
    countiesWorked: [] as string[],
    redFlagsEncountered: [] as string[],
    notes: ''
  })

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  const todayISO = new Date().toISOString().split('T')[0]

  // Check if already submitted today
  const alreadySubmittedToday = currentRole === 'sms_va'
    ? smsReports.some(r => r.date === todayISO && r.submittedBy === currentUserName)
    : underwriterReports.some(r => r.date === todayISO && r.submittedBy === currentUserName)

  const handleSMSSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addSMSReport({
      date: todayISO,
      submittedBy: currentUserName,
      textsSent: parseInt(smsForm.textsSent) || 0,
      textsReceived: parseInt(smsForm.textsReceived) || 0,
      leadsGenerated: parseInt(smsForm.leadsGenerated) || 0,
      hotLeads: parseInt(smsForm.hotLeads) || 0,
      callsBooked: parseInt(smsForm.callsBooked) || 0,
      challenges: smsForm.challenges || undefined,
      notes: smsForm.notes || undefined
    })
    
    setSubmitted(true)
  }

  const handleUWSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addUnderwriterReport({
      date: todayISO,
      submittedBy: currentUserName,
      propertiesResearched: parseInt(uwForm.propertiesResearched) || 0,
      propertiesApproved: parseInt(uwForm.propertiesApproved) || 0,
      propertiesRejected: parseInt(uwForm.propertiesRejected) || 0,
      avgTimePerComp: parseInt(uwForm.avgTimePerComp) || 0,
      hoursWorked: parseFloat(uwForm.hoursWorked) || 0,
      countiesWorked: uwForm.countiesWorked,
      redFlagsEncountered: uwForm.redFlagsEncountered,
      notes: uwForm.notes || undefined
    })
    
    setSubmitted(true)
  }

  const toggleCounty = (county: string) => {
    setUwForm(prev => ({
      ...prev,
      countiesWorked: prev.countiesWorked.includes(county)
        ? prev.countiesWorked.filter(c => c !== county)
        : [...prev.countiesWorked, county]
    }))
  }

  const toggleRedFlag = (flag: string) => {
    setUwForm(prev => ({
      ...prev,
      redFlagsEncountered: prev.redFlagsEncountered.includes(flag)
        ? prev.redFlagsEncountered.filter(f => f !== flag)
        : [...prev.redFlagsEncountered, flag]
    }))
  }

  // Calculate response rate for preview
  const responseRate = smsForm.textsSent && smsForm.textsReceived
    ? ((parseInt(smsForm.textsReceived) / parseInt(smsForm.textsSent)) * 100).toFixed(1)
    : '0.0'

  if (submitted || alreadySubmittedToday) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">EOD Report</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircleIcon className="size-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Submitted!</h2>
            <p className="text-muted-foreground">
              {alreadySubmittedToday && !submitted 
                ? "You've already submitted your EOD report for today."
                : "Your end-of-day report has been recorded. Great work today!"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin can choose which form to fill
  if (currentRole === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">EOD Report</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-muted-foreground mb-4">
              As an admin, you can view all reports but don't need to submit one.
            </p>
            <p className="text-sm text-muted-foreground">
              Switch to SMS VA or Underwriter role using the role selector to submit a report.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">EOD Report</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* SMS VA Form */}
      {currentRole === 'sms_va' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="size-5" />
              SMS Team Daily Report
            </CardTitle>
            <CardDescription>
              Report your outreach and lead generation metrics for today.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSMSSubmit}>
            <CardContent className="space-y-6">
              {/* Outreach Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Outreach Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="textsSent" className="flex items-center gap-2">
                      <MessageSquareIcon className="size-4 text-chart-1" />
                      Texts Sent
                    </Label>
                    <Input
                      id="textsSent"
                      type="number"
                      placeholder="0"
                      value={smsForm.textsSent}
                      onChange={(e) => setSmsForm({ ...smsForm, textsSent: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textsReceived" className="flex items-center gap-2">
                      <MessageSquareTextIcon className="size-4 text-chart-2" />
                      Texts Received
                    </Label>
                    <Input
                      id="textsReceived"
                      type="number"
                      placeholder="0"
                      value={smsForm.textsReceived}
                      onChange={(e) => setSmsForm({ ...smsForm, textsReceived: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                {/* Response Rate Preview */}
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <Badge variant="outline" className="text-chart-3 bg-chart-3/10">
                    {responseRate}%
                  </Badge>
                </div>
              </div>

              {/* Lead Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Lead Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leadsGenerated" className="flex items-center gap-2">
                      <UsersIcon className="size-4 text-chart-4" />
                      Leads Generated
                    </Label>
                    <Input
                      id="leadsGenerated"
                      type="number"
                      placeholder="0"
                      value={smsForm.leadsGenerated}
                      onChange={(e) => setSmsForm({ ...smsForm, leadsGenerated: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotLeads" className="flex items-center gap-2">
                      <FlameIcon className="size-4 text-destructive" />
                      Hot Leads
                    </Label>
                    <Input
                      id="hotLeads"
                      type="number"
                      placeholder="0"
                      value={smsForm.hotLeads}
                      onChange={(e) => setSmsForm({ ...smsForm, hotLeads: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callsBooked" className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-green-500" />
                      Calls Booked
                    </Label>
                    <Input
                      id="callsBooked"
                      type="number"
                      placeholder="0"
                      value={smsForm.callsBooked}
                      onChange={(e) => setSmsForm({ ...smsForm, callsBooked: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="challenges">Challenges Encountered (optional)</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Any blockers, difficult conversations, or issues..."
                    value={smsForm.challenges}
                    onChange={(e) => setSmsForm({ ...smsForm, challenges: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Anything else worth noting..."
                    value={smsForm.notes}
                    onChange={(e) => setSmsForm({ ...smsForm, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <SendIcon className="size-4 mr-2" />
                Submit EOD Report
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Underwriter Form */}
      {currentRole === 'underwriter' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="size-5" />
              Underwriter Daily Report
            </CardTitle>
            <CardDescription>
              Report your property research and valuation metrics for today.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUWSubmit}>
            <CardContent className="space-y-6">
              {/* Research Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Research Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertiesResearched" className="flex items-center gap-2">
                      <SearchIcon className="size-4 text-chart-1" />
                      Researched
                    </Label>
                    <Input
                      id="propertiesResearched"
                      type="number"
                      placeholder="0"
                      value={uwForm.propertiesResearched}
                      onChange={(e) => setUwForm({ ...uwForm, propertiesResearched: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertiesApproved" className="flex items-center gap-2">
                      <CheckCircleIcon className="size-4 text-green-500" />
                      Approved
                    </Label>
                    <Input
                      id="propertiesApproved"
                      type="number"
                      placeholder="0"
                      value={uwForm.propertiesApproved}
                      onChange={(e) => setUwForm({ ...uwForm, propertiesApproved: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertiesRejected" className="flex items-center gap-2">
                      <XCircleIcon className="size-4 text-destructive" />
                      Rejected
                    </Label>
                    <Input
                      id="propertiesRejected"
                      type="number"
                      placeholder="0"
                      value={uwForm.propertiesRejected}
                      onChange={(e) => setUwForm({ ...uwForm, propertiesRejected: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Time Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Time Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avgTimePerComp" className="flex items-center gap-2">
                      <ClockIcon className="size-4 text-chart-2" />
                      Avg Time per Comp (minutes)
                    </Label>
                    <Input
                      id="avgTimePerComp"
                      type="number"
                      placeholder="15"
                      value={uwForm.avgTimePerComp}
                      onChange={(e) => setUwForm({ ...uwForm, avgTimePerComp: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursWorked" className="flex items-center gap-2">
                      <ClockIcon className="size-4 text-chart-3" />
                      Hours Worked
                    </Label>
                    <Input
                      id="hoursWorked"
                      type="number"
                      step="0.5"
                      placeholder="8"
                      value={uwForm.hoursWorked}
                      onChange={(e) => setUwForm({ ...uwForm, hoursWorked: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Counties Worked */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Counties Worked
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTIES.map((county) => (
                    <div key={county} className="flex items-center space-x-2">
                      <Checkbox
                        id={county}
                        checked={uwForm.countiesWorked.includes(county)}
                        onCheckedChange={() => toggleCounty(county)}
                      />
                      <label htmlFor={county} className="text-sm cursor-pointer">
                        {county}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangleIcon className="size-4 text-yellow-500" />
                  Red Flags Encountered
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {RED_FLAGS_OPTIONS.map((flag) => (
                    <div key={flag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`flag-${flag}`}
                        checked={uwForm.redFlagsEncountered.includes(flag)}
                        onCheckedChange={() => toggleRedFlag(flag)}
                      />
                      <label htmlFor={`flag-${flag}`} className="text-sm cursor-pointer">
                        {flag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="uwNotes">Additional Notes (optional)</Label>
                <Textarea
                  id="uwNotes"
                  placeholder="Market observations, process improvements, etc..."
                  value={uwForm.notes}
                  onChange={(e) => setUwForm({ ...uwForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <SendIcon className="size-4 mr-2" />
                Submit EOD Report
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}
