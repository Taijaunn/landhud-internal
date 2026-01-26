'use client'

import { useState } from 'react'
import {
  BookOpenIcon,
  PlayCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GripVerticalIcon,
  VideoIcon,
  ClockIcon,
  CheckCircleIcon,
  SaveIcon,
  XIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { Checkbox } from '@/components/ui/checkbox'

import { useTrainingStore, useUserStore } from '@/lib/data/store'
import type { TrainingChapter, TrainingSection, UserRole } from '@/lib/types'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'sms_va', label: 'SMS VA' },
  { value: 'underwriter', label: 'Underwriter' }
]

export default function TrainingPage() {
  const { currentRole } = useUserStore()
  const { 
    chapters, 
    addChapter, 
    updateChapter, 
    deleteChapter,
    addSection,
    updateSection,
    deleteSection 
  } = useTrainingStore()
  
  const isAdmin = currentRole === 'admin'
  const [openChapters, setOpenChapters] = useState<string[]>([])
  
  // Dialog states
  const [chapterDialog, setChapterDialog] = useState<{ open: boolean; chapter?: TrainingChapter }>({ open: false })
  const [sectionDialog, setSectionDialog] = useState<{ open: boolean; chapterId?: string; section?: TrainingSection }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'chapter' | 'section'; id: string; parentId?: string }>({ open: false, type: 'chapter', id: '' })
  
  // Form states
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', forRoles: ['sms_va', 'underwriter', 'admin'] as UserRole[] })
  const [sectionForm, setSectionForm] = useState({ title: '', description: '', videoUrl: '', videoDuration: '' })

  // Filter chapters based on user role
  const visibleChapters = chapters.filter(ch => 
    isAdmin || ch.forRoles.includes(currentRole)
  )

  const toggleChapter = (id: string) => {
    setOpenChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleAddChapter = () => {
    setChapterForm({ title: '', description: '', forRoles: ['sms_va', 'underwriter', 'admin'] })
    setChapterDialog({ open: true })
  }

  const handleEditChapter = (chapter: TrainingChapter) => {
    setChapterForm({ 
      title: chapter.title, 
      description: chapter.description,
      forRoles: chapter.forRoles
    })
    setChapterDialog({ open: true, chapter })
  }

  const handleSaveChapter = () => {
    if (chapterDialog.chapter) {
      updateChapter(chapterDialog.chapter.id, {
        title: chapterForm.title,
        description: chapterForm.description,
        forRoles: chapterForm.forRoles
      })
    } else {
      addChapter({
        title: chapterForm.title,
        description: chapterForm.description,
        forRoles: chapterForm.forRoles
      })
    }
    setChapterDialog({ open: false })
  }

  const handleAddSection = (chapterId: string) => {
    setSectionForm({ title: '', description: '', videoUrl: '', videoDuration: '' })
    setSectionDialog({ open: true, chapterId })
  }

  const handleEditSection = (chapterId: string, section: TrainingSection) => {
    setSectionForm({
      title: section.title,
      description: section.description || '',
      videoUrl: section.videoUrl || '',
      videoDuration: section.videoDuration || ''
    })
    setSectionDialog({ open: true, chapterId, section })
  }

  const handleSaveSection = () => {
    if (!sectionDialog.chapterId) return
    
    if (sectionDialog.section) {
      updateSection(sectionDialog.chapterId, sectionDialog.section.id, {
        title: sectionForm.title,
        description: sectionForm.description || undefined,
        videoUrl: sectionForm.videoUrl || undefined,
        videoDuration: sectionForm.videoDuration || undefined
      })
    } else {
      addSection(sectionDialog.chapterId, {
        title: sectionForm.title,
        description: sectionForm.description || undefined,
        videoUrl: sectionForm.videoUrl || undefined,
        videoDuration: sectionForm.videoDuration || undefined
      })
    }
    setSectionDialog({ open: false })
  }

  const handleDelete = () => {
    if (deleteDialog.type === 'chapter') {
      deleteChapter(deleteDialog.id)
    } else if (deleteDialog.parentId) {
      deleteSection(deleteDialog.parentId, deleteDialog.id)
    }
    setDeleteDialog({ open: false, type: 'chapter', id: '' })
  }

  const toggleRole = (role: UserRole) => {
    setChapterForm(prev => ({
      ...prev,
      forRoles: prev.forRoles.includes(role)
        ? prev.forRoles.filter(r => r !== role)
        : [...prev.forRoles, role]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training</h1>
          <p className="text-muted-foreground">Learn the LandHud way</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddChapter}>
            <PlusIcon className="size-4 mr-2" />
            Add Chapter
          </Button>
        )}
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {visibleChapters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpenIcon className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No training content available yet.</p>
              {isAdmin && (
                <Button className="mt-4" onClick={handleAddChapter}>
                  <PlusIcon className="size-4 mr-2" />
                  Add Your First Chapter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          visibleChapters.map((chapter, index) => (
            <Card key={chapter.id}>
              <Collapsible 
                open={openChapters.includes(chapter.id)}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-start gap-3 text-left group">
                        <div className="mt-1">
                          {openChapters.includes(chapter.id) ? (
                            <ChevronDownIcon className="size-5 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            Chapter {index + 1}: {chapter.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {chapter.description}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {chapter.sections.length} {chapter.sections.length === 1 ? 'lesson' : 'lessons'}
                            </Badge>
                            {isAdmin && (
                              <div className="flex gap-1">
                                {chapter.forRoles.map(role => (
                                  <Badge key={role} variant="secondary" className="text-xs">
                                    {role === 'sms_va' ? 'SMS' : role === 'underwriter' ? 'UW' : 'Admin'}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditChapter(chapter)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: 'chapter', id: chapter.id })}
                        >
                          <TrashIcon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-l-2 border-muted ml-2 pl-6 space-y-3">
                      {chapter.sections.map((section, sectionIndex) => (
                        <div 
                          key={section.id}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {section.videoUrl ? (
                                <PlayCircleIcon className="size-5 text-chart-1" />
                              ) : (
                                <VideoIcon className="size-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {index + 1}.{sectionIndex + 1} {section.title}
                              </p>
                              {section.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {section.description}
                                </p>
                              )}
                              {section.videoDuration && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <ClockIcon className="size-3" />
                                  {section.videoDuration}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {section.videoUrl ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(section.videoUrl, '_blank')}
                              >
                                <PlayCircleIcon className="size-4 mr-1" />
                                Watch
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Coming Soon
                              </Badge>
                            )}
                            
                            {isAdmin && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="size-8"
                                  onClick={() => handleEditSection(chapter.id, section)}
                                >
                                  <PencilIcon className="size-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="size-8"
                                  onClick={() => setDeleteDialog({ 
                                    open: true, 
                                    type: 'section', 
                                    id: section.id,
                                    parentId: chapter.id 
                                  })}
                                >
                                  <TrashIcon className="size-3 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-muted-foreground"
                          onClick={() => handleAddSection(chapter.id)}
                        >
                          <PlusIcon className="size-4 mr-2" />
                          Add Lesson
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Chapter Dialog */}
      <Dialog open={chapterDialog.open} onOpenChange={(open) => setChapterDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chapterDialog.chapter ? 'Edit Chapter' : 'Add Chapter'}
            </DialogTitle>
            <DialogDescription>
              {chapterDialog.chapter 
                ? 'Update the chapter details below.'
                : 'Create a new training chapter.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapterTitle">Title</Label>
              <Input
                id="chapterTitle"
                placeholder="Chapter title"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterDesc">Description</Label>
              <Textarea
                id="chapterDesc"
                placeholder="What will learners get from this chapter?"
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Visible to Roles</Label>
              <div className="flex gap-4">
                {ROLE_OPTIONS.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.value}`}
                      checked={chapterForm.forRoles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <label htmlFor={`role-${role.value}`} className="text-sm cursor-pointer">
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={!chapterForm.title}>
              <SaveIcon className="size-4 mr-2" />
              Save Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={sectionDialog.open} onOpenChange={(open) => setSectionDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sectionDialog.section ? 'Edit Lesson' : 'Add Lesson'}
            </DialogTitle>
            <DialogDescription>
              {sectionDialog.section 
                ? 'Update the lesson details below.'
                : 'Add a new lesson to this chapter.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Title</Label>
              <Input
                id="sectionTitle"
                placeholder="Lesson title"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionDesc">Description (optional)</Label>
              <Input
                id="sectionDesc"
                placeholder="Brief description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.loom.com/share/..."
                value={sectionForm.videoUrl}
                onChange={(e) => setSectionForm({ ...sectionForm, videoUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoDuration">Duration (optional)</Label>
              <Input
                id="videoDuration"
                placeholder="5:00"
                value={sectionForm.videoDuration}
                onChange={(e) => setSectionForm({ ...sectionForm, videoDuration: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection} disabled={!sectionForm.title}>
              <SaveIcon className="size-4 mr-2" />
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type === 'chapter' ? 'Chapter' : 'Lesson'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. 
              {deleteDialog.type === 'chapter' && ' All lessons in this chapter will also be deleted.'}
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
