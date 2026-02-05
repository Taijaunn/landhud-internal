'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  MessageSquareIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  CheckIcon,
  CheckCheckIcon,
  XCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ClockIcon,
  Loader2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

import type { CRMCommunication, CRMLead } from '@/lib/types/crm'
import { useCRMStore } from '@/lib/data/crm-store'

interface CommunicationPanelProps {
  lead: CRMLead
  communications: CRMCommunication[]
  userId: string
  userName: string
}

export function CommunicationPanel({ 
  lead, 
  communications, 
  userId, 
  userName 
}: CommunicationPanelProps) {
  const [activeTab, setActiveTab] = useState('messages')
  const [smsMessage, setSmsMessage] = useState('')
  const [sendingSms, setSendingSms] = useState(false)
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  
  const { sendSMS, logCall, fetchLead } = useCRMStore()
  const { toast } = useToast()

  const smsMessages = communications.filter(c => c.type === 'sms')
  const calls = communications.filter(c => c.type === 'call')
  const emails = communications.filter(c => c.type === 'email')

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) return
    
    setSendingSms(true)
    try {
      await sendSMS(lead.id, lead.owner_phone, smsMessage.trim(), userId, userName)
      setSmsMessage('')
      toast({
        title: 'SMS Sent',
        description: 'Your message has been sent successfully.',
      })
      await fetchLead(lead.id)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SMS. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSendingSms(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquareIcon className="size-4 mr-2" />
          SMS
        </Button>
        <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <PhoneIcon className="size-4 mr-2" />
              Log Call
            </Button>
          </DialogTrigger>
          <LogCallDialog 
            lead={lead}
            userId={userId}
            userName={userName}
            onClose={() => setCallDialogOpen(false)}
          />
        </Dialog>
        <Button variant="outline" className="flex-1" disabled>
          <MailIcon className="size-4 mr-2" />
          Email
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="messages" className="flex-1">
            Messages ({smsMessages.length})
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex-1">
            Calls ({calls.length})
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex-1">
            Emails ({emails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4 space-y-4">
          {/* SMS Composer */}
          <div className="space-y-2">
            <Textarea
              placeholder={`Send SMS to ${lead.owner_first_name}...`}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                To: {lead.owner_phone}
              </p>
              <Button 
                size="sm" 
                onClick={handleSendSMS}
                disabled={!smsMessage.trim() || sendingSms}
              >
                {sendingSms ? (
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                ) : (
                  <SendIcon className="size-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </div>

          {/* Message History */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {smsMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquareIcon className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                smsMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          <ScrollArea className="h-[380px]">
            <div className="space-y-3">
              {calls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PhoneIcon className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No calls logged yet</p>
                </div>
              ) : (
                calls.map((call) => (
                  <CallLogItem key={call.id} call={call} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            <MailIcon className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Email integration coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Message Bubble Component
function MessageBubble({ message }: { message: CRMCommunication }) {
  const isOutbound = message.direction === 'outbound'
  
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
        isOutbound 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <div className={`flex items-center gap-1.5 mt-1 text-xs ${
          isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {isOutbound ? (
            <ArrowUpRightIcon className="size-3" />
          ) : (
            <ArrowDownLeftIcon className="size-3" />
          )}
          <span>
            {format(new Date(message.created_at), 'MMM d, h:mm a')}
          </span>
          {isOutbound && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </div>
  )
}

// Message Status Indicator
function MessageStatus({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <ClockIcon className="size-3" />
    case 'sent':
      return <CheckIcon className="size-3" />
    case 'delivered':
      return <CheckCheckIcon className="size-3" />
    case 'failed':
      return <XCircleIcon className="size-3 text-red-400" />
    default:
      return null
  }
}

// Call Log Item
function CallLogItem({ call }: { call: CRMCommunication }) {
  const isOutbound = call.direction === 'outbound'
  const duration = call.call_duration_seconds 
    ? `${Math.floor(call.call_duration_seconds / 60)}m ${call.call_duration_seconds % 60}s`
    : 'N/A'
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <div className={`size-8 rounded-full flex items-center justify-center ${
        isOutbound ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'
      }`}>
        {isOutbound ? (
          <ArrowUpRightIcon className="size-4" />
        ) : (
          <ArrowDownLeftIcon className="size-4" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {isOutbound ? 'Outgoing Call' : 'Incoming Call'}
          </p>
          <span className="text-xs text-muted-foreground">
            {format(new Date(call.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>Duration: {duration}</span>
          {call.call_outcome && (
            <span>• {call.call_outcome}</span>
          )}
        </div>
        {call.body && (
          <p className="text-sm mt-2 text-muted-foreground">{call.body}</p>
        )}
      </div>
    </div>
  )
}

// Log Call Dialog
function LogCallDialog({ 
  lead, 
  userId, 
  userName, 
  onClose 
}: { 
  lead: CRMLead
  userId: string
  userName: string
  onClose: () => void
}) {
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound')
  const [duration, setDuration] = useState('')
  const [outcome, setOutcome] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { logCall, fetchLead } = useCRMStore()
  const { toast } = useToast()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await logCall(
        lead.id,
        {
          direction,
          body: notes,
          call_duration_seconds: duration ? parseInt(duration) * 60 : undefined,
          call_outcome: outcome || undefined,
        },
        userId,
        userName
      )
      toast({
        title: 'Call Logged',
        description: 'The call has been logged successfully.',
      })
      await fetchLead(lead.id)
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log call. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log Call</DialogTitle>
        <DialogDescription>
          Log a call with {lead.owner_first_name} {lead.owner_last_name}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as 'outbound' | 'inbound')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outgoing</SelectItem>
                <SelectItem value="inbound">Incoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Outcome</Label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="voicemail">Left Voicemail</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="wrong_number">Wrong Number</SelectItem>
              <SelectItem value="callback_scheduled">Callback Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Call notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2Icon className="size-4 mr-2 animate-spin" />}
          Log Call
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
