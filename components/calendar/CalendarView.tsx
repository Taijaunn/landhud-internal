'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  DollarSignIcon,
  UsersIcon,
  FlagIcon,
  PartyPopperIcon,
  CircleIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { useCalendarStore, useUserStore } from '@/lib/data/store'
import type { CalendarEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', icon: UsersIcon, color: 'bg-blue-500' },
  { value: 'deadline', label: 'Deadline', icon: FlagIcon, color: 'bg-red-500' },
  { value: 'holiday', label: 'Holiday', icon: PartyPopperIcon, color: 'bg-purple-500' },
  { value: 'other', label: 'Other', icon: CircleIcon, color: 'bg-gray-500' },
] as const

const RECURRING_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
] as const

function getEventIcon(type: CalendarEvent['type']) {
  switch (type) {
    case 'pay_day': return DollarSignIcon
    case 'meeting': return UsersIcon
    case 'deadline': return FlagIcon
    case 'holiday': return PartyPopperIcon
    default: return CircleIcon
  }
}

function getEventColor(type: CalendarEvent['type']) {
  switch (type) {
    case 'pay_day': return 'bg-green-500'
    case 'meeting': return 'bg-blue-500'
    case 'deadline': return 'bg-red-500'
    case 'holiday': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

export function CalendarView() {
  const { currentRole, currentUserId } = useUserStore()
  const { events, addEvent, updateEvent, deleteEvent, getEventsForDate } = useCalendarStore()
  
  const isAdmin = currentRole === 'admin'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [daySheetOpen, setDaySheetOpen] = useState(false)
  
  // Dialog states
  const [eventDialog, setEventDialog] = useState<{ open: boolean; event?: CalendarEvent; date?: Date }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    type: 'meeting' as CalendarEvent['type'],
    recurring: 'none' as CalendarEvent['recurring']
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }, [year, month, startingDayOfWeek, daysInMonth])

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setDaySheetOpen(true)
  }

  const handleAddEvent = (date?: Date) => {
    const targetDate = date || selectedDate || new Date()
    setForm({
      title: '',
      description: '',
      date: targetDate.toISOString().split('T')[0],
      time: '',
      endTime: '',
      type: 'meeting',
      recurring: 'none'
    })
    setEventDialog({ open: true, date: targetDate })
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      endTime: event.endTime || '',
      type: event.type,
      recurring: event.recurring || 'none'
    })
    setEventDialog({ open: true, event })
  }

  const handleSaveEvent = () => {
    const eventData = {
      title: form.title,
      description: form.description || undefined,
      date: form.date,
      time: form.time || undefined,
      endTime: form.endTime || undefined,
      type: form.type,
      recurring: form.recurring === 'none' ? undefined : form.recurring,
      recurringDay: form.recurring === 'monthly' ? new Date(form.date).getDate() : undefined,
      createdBy: currentUserId,
      color: getEventColor(form.type)
    }
    
    if (eventDialog.event) {
      updateEvent(eventDialog.event.id, eventData)
    } else {
      addEvent(eventData)
    }
    setEventDialog({ open: false })
    
    // Refresh selected date events
    if (selectedDate) {
      const newDate = new Date(form.date)
      if (newDate.toDateString() === selectedDate.toDateString()) {
        // Force re-render
        setSelectedDate(new Date(selectedDate))
      }
    }
  }

  const handleDelete = () => {
    deleteEvent(deleteDialog.id)
    setDeleteDialog({ open: false, id: '' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Calendar</h1>
          <p className="text-muted-foreground">View pay dates, meetings, and important events</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleAddEvent()}>
            <PlusIcon className="size-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button variant="ghost" onClick={goToToday}>
                Today
              </Button>
            </div>
            <CardTitle className="text-xl">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="w-[120px]" /> {/* Spacer for centering */}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div key={`empty-${index}`} className="min-h-[100px] bg-muted/30 p-2" />
                )
              }
              
              const dayEvents = getEventsForDate(date)
              const today = isToday(date)
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "min-h-[100px] bg-card p-2 text-left transition-colors hover:bg-muted/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center size-7 rounded-full text-sm font-medium mb-1",
                    today && "bg-primary text-primary-foreground"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  {/* Event dots */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded truncate text-white",
                          event.color || getEventColor(event.type)
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-sm">Pay Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-500" />
              <span className="text-sm">Meeting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-sm">Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-purple-500" />
              <span className="text-sm">Holiday</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Sheet */}
      <Sheet open={daySheetOpen} onOpenChange={setDaySheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </SheetTitle>
            <SheetDescription>
              {selectedDateEvents.length === 0 
                ? 'No events scheduled' 
                : `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? 's' : ''}`
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setDaySheetOpen(false)
                  handleAddEvent(selectedDate || undefined)
                }}
              >
                <PlusIcon className="size-4 mr-2" />
                Add Event
              </Button>
            )}
            
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarIcon className="size-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No events for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => {
                  const Icon = getEventIcon(event.type)
                  const canEdit = isAdmin && event.type !== 'pay_day'
                  
                  return (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              event.color || getEventColor(event.type),
                              "bg-opacity-20"
                            )}>
                              <Icon className={cn(
                                "size-4",
                                event.type === 'pay_day' && "text-green-500",
                                event.type === 'meeting' && "text-blue-500",
                                event.type === 'deadline' && "text-red-500",
                                event.type === 'holiday' && "text-purple-500"
                              )} />
                            </div>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              {event.time && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <ClockIcon className="size-3" />
                                  {event.time}{event.endTime && ` - ${event.endTime}`}
                                </p>
                              )}
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                              {event.recurring && event.recurring !== 'none' && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Recurring {event.recurring}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                  setDaySheetOpen(false)
                                  handleEditEvent(event)
                                }}
                              >
                                <PencilIcon className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setDeleteDialog({ open: true, id: event.id })}
                              >
                                <TrashIcon className="size-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Event Dialog */}
      <Dialog open={eventDialog.open} onOpenChange={(open) => setEventDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {eventDialog.event ? 'Edit Event' : 'Add Event'}
            </DialogTitle>
            <DialogDescription>
              {eventDialog.event 
                ? 'Update the event details below.'
                : 'Create a new calendar event.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Title</Label>
              <Input
                id="eventTitle"
                placeholder="Event title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDesc">Description (optional)</Label>
              <Textarea
                id="eventDesc"
                placeholder="Event description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value as CalendarEvent['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventTime">Start Time (optional)</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndTime">End Time (optional)</Label>
                <Input
                  id="eventEndTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select
                value={form.recurring}
                onValueChange={(value) => setForm({ ...form, recurring: value as CalendarEvent['recurring'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={!form.title || !form.date}>
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
