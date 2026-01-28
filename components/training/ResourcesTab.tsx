'use client'

import { useState } from 'react'
import {
  FileTextIcon,
  LinkIcon,
  CheckSquareIcon,
  VideoIcon,
  ScrollTextIcon,
  SearchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'

import { useTrainingStore, useUserStore } from '@/lib/data/store'
import type { Resource, UserRole } from '@/lib/types'

const RESOURCE_TYPES = [
  { value: 'script', label: 'Script', icon: ScrollTextIcon },
  { value: 'guide', label: 'Guide', icon: FileTextIcon },
  { value: 'template', label: 'Template', icon: FileTextIcon },
  { value: 'checklist', label: 'Checklist', icon: CheckSquareIcon },
  { value: 'video', label: 'Video', icon: VideoIcon },
] as const

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'sms_va', label: 'SMS VA' },
  { value: 'underwriter', label: 'Underwriter' }
]

function getResourceIcon(type: Resource['type']) {
  switch (type) {
    case 'script': return ScrollTextIcon
    case 'checklist': return CheckSquareIcon
    case 'video': return VideoIcon
    default: return FileTextIcon
  }
}

export function ResourcesTab() {
  const { currentRole } = useUserStore()
  const { resources, addResource, updateResource, deleteResource } = useTrainingStore()
  
  const isAdmin = currentRole === 'admin'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedResources, setExpandedResources] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Dialog states
  const [resourceDialog, setResourceDialog] = useState<{ open: boolean; resource?: Resource }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'guide' as Resource['type'],
    category: '',
    content: '',
    url: '',
    forRoles: ['sms_va', 'underwriter', 'admin'] as UserRole[]
  })

  // Filter resources based on role and search
  const visibleResources = resources.filter(r => {
    const matchesRole = isAdmin || r.forRoles.includes(currentRole)
    const matchesSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  // Group by category
  const groupedResources = visibleResources.reduce((acc, resource) => {
    const category = resource.category || 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  const toggleExpanded = (id: string) => {
    setExpandedResources(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const handleCopyContent = async (resource: Resource) => {
    if (resource.content) {
      await navigator.clipboard.writeText(resource.content)
      setCopiedId(resource.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleAddResource = () => {
    setForm({
      title: '',
      description: '',
      type: 'guide',
      category: '',
      content: '',
      url: '',
      forRoles: ['sms_va', 'underwriter', 'admin']
    })
    setResourceDialog({ open: true })
  }

  const handleEditResource = (resource: Resource) => {
    setForm({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      content: resource.content || '',
      url: resource.url || '',
      forRoles: resource.forRoles
    })
    setResourceDialog({ open: true, resource })
  }

  const handleSaveResource = () => {
    if (resourceDialog.resource) {
      updateResource(resourceDialog.resource.id, form)
    } else {
      addResource(form)
    }
    setResourceDialog({ open: false })
  }

  const handleDelete = () => {
    deleteResource(deleteDialog.id)
    setDeleteDialog({ open: false, id: '' })
  }

  const toggleRole = (role: UserRole) => {
    setForm(prev => ({
      ...prev,
      forRoles: prev.forRoles.includes(role)
        ? prev.forRoles.filter(r => r !== role)
        : [...prev.forRoles, role]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Button onClick={handleAddResource}>
            <PlusIcon className="size-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Resources by Category */}
      {Object.entries(groupedResources).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileTextIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resources found.</p>
            {isAdmin && (
              <Button className="mt-4" onClick={handleAddResource}>
                <PlusIcon className="size-4 mr-2" />
                Add Your First Resource
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedResources).map(([category, categoryResources]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </h3>
            <div className="space-y-2">
              {categoryResources.map((resource) => {
                const Icon = getResourceIcon(resource.type)
                const isExpanded = expandedResources.includes(resource.id)
                
                return (
                  <Card key={resource.id}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(resource.id)}>
                      <CardHeader className="py-4">
                        <div className="flex items-start justify-between">
                          <CollapsibleTrigger asChild>
                            <button className="flex items-start gap-3 text-left group">
                              <div className="mt-0.5">
                                {isExpanded ? (
                                  <ChevronDownIcon className="size-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="size-4 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base group-hover:text-primary transition-colors">
                                  {resource.title}
                                </CardTitle>
                                <CardDescription className="mt-0.5">
                                  {resource.description}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {resource.type}
                                  </Badge>
                                  {isAdmin && resource.forRoles.map(role => (
                                    <Badge key={role} variant="secondary" className="text-xs">
                                      {role === 'sms_va' ? 'SMS' : role === 'underwriter' ? 'UW' : 'Admin'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          
                          <div className="flex items-center gap-1">
                            {resource.content && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyContent(resource)}
                              >
                                {copiedId === resource.id ? (
                                  <CheckIcon className="size-4 text-green-500" />
                                ) : (
                                  <CopyIcon className="size-4" />
                                )}
                              </Button>
                            )}
                            {resource.url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(resource.url, '_blank')}
                              >
                                <LinkIcon className="size-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditResource(resource)}
                                >
                                  <PencilIcon className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialog({ open: true, id: resource.id })}
                                >
                                  <TrashIcon className="size-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CollapsibleContent>
                        {resource.content && (
                          <CardContent className="pt-0 pb-4">
                            <div className="rounded-lg bg-muted/50 p-4 border">
                              <pre className="text-sm whitespace-pre-wrap font-mono">
                                {resource.content}
                              </pre>
                            </div>
                          </CardContent>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Resource Dialog */}
      <Dialog open={resourceDialog.open} onOpenChange={(open) => setResourceDialog({ open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {resourceDialog.resource ? 'Edit Resource' : 'Add Resource'}
            </DialogTitle>
            <DialogDescription>
              {resourceDialog.resource 
                ? 'Update the resource details below.'
                : 'Create a new resource for the team.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Resource title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., SMS Outreach, Underwriting"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this resource"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value as Resource['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (optional)</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Resource content (scripts, checklists, etc.)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visible to Roles</Label>
              <div className="flex gap-4">
                {ROLE_OPTIONS.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`res-role-${role.value}`}
                      checked={form.forRoles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <label htmlFor={`res-role-${role.value}`} className="text-sm cursor-pointer">
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSaveResource} disabled={!form.title || !form.category}>
              Save Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
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
