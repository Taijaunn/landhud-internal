'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  PinIcon,
  PinOffIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  Loader2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

import type { CRMNote } from '@/lib/types/crm'
import { useCRMStore } from '@/lib/data/crm-store'

interface NotesSectionProps {
  leadId: string
  notes: CRMNote[]
  userId: string
  userName: string
}

export function NotesSection({ leadId, notes, userId, userName }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  
  const { addNote, toggleNotePin, deleteNote, fetchLead } = useCRMStore()
  const { toast } = useToast()

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setAddingNote(true)
    try {
      await addNote(leadId, newNote.trim(), userId, userName)
      setNewNote('')
      setIsAdding(false)
      await fetchLead(leadId)
      toast({
        title: 'Note Added',
        description: 'Your note has been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note.',
        variant: 'destructive',
      })
    } finally {
      setAddingNote(false)
    }
  }

  const handleTogglePin = async (note: CRMNote) => {
    try {
      await toggleNotePin(note.id, !note.is_pinned)
      await fetchLead(leadId)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update note.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      await fetchLead(leadId)
      toast({
        title: 'Note Deleted',
        description: 'The note has been removed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note.',
        variant: 'destructive',
      })
    }
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter(n => n.is_pinned)
  const unpinnedNotes = notes.filter(n => !n.is_pinned)

  return (
    <div className="space-y-4">
      {/* Add Note Button/Form */}
      {isAdding ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewNote('')
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
            >
              {addingNote && <Loader2Icon className="size-4 mr-2 animate-spin" />}
              Add Note
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <PlusIcon className="size-4 mr-2" />
          Add Note
        </Button>
      )}

      {/* Notes List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Add notes to keep track of important information</p>
            </div>
          ) : (
            <>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Pinned
                  </p>
                  {pinnedNotes.map((note) => (
                    <NoteItem 
                      key={note.id} 
                      note={note}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
              
              {/* Unpinned Notes */}
              {unpinnedNotes.length > 0 && (
                <div className="space-y-2">
                  {pinnedNotes.length > 0 && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">
                      Other Notes
                    </p>
                  )}
                  {unpinnedNotes.map((note) => (
                    <NoteItem 
                      key={note.id} 
                      note={note}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface NoteItemProps {
  note: CRMNote
  onTogglePin: (note: CRMNote) => void
  onDelete: (id: string) => void
}

function NoteItem({ note, onTogglePin, onDelete }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  
  const { updateNote, fetchLead } = useCRMStore()
  
  const initials = note.created_by_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSave = async () => {
    if (!editContent.trim()) return
    
    try {
      await updateNote(note.id, editContent.trim())
      await fetchLead(note.lead_id)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  return (
    <div className={`p-3 rounded-lg border group ${note.is_pinned ? 'bg-yellow-500/5 border-yellow-500/20' : ''}`}>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsEditing(false)
                setEditContent(note.content)
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-7"
                onClick={() => onTogglePin(note)}
              >
                {note.is_pinned ? (
                  <PinOffIcon className="size-3.5" />
                ) : (
                  <PinIcon className="size-3.5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-7"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="size-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(note.id)}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Avatar className="size-4">
              <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
            </Avatar>
            <span>{note.created_by_name}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
          </div>
        </>
      )}
    </div>
  )
}
