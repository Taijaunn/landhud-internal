'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileSpreadsheetIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  UploadCloudIcon,
  DownloadIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  FileIcon,
  XCircleIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

import { useLeadListsStore } from '@/lib/data/store'
import type { LeadList } from '@/lib/types'

const statusConfig: Record<LeadList['status'], { label: string; color: string; icon: React.ReactNode }> = {
  incoming: { 
    label: 'Incoming', 
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <ClockIcon className="size-3" />
  },
  scrubbing: { 
    label: 'Scrubbing', 
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    icon: <RefreshCwIcon className="size-3 animate-spin" />
  },
  ready: { 
    label: 'Ready for Upload', 
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: <CheckCircleIcon className="size-3" />
  },
  uploaded_to_launchcontrol: { 
    label: 'Uploaded', 
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: <UploadCloudIcon className="size-3" />
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: <AlertCircleIcon className="size-3" />
  },
  error: { 
    label: 'Error', 
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <AlertCircleIcon className="size-3" />
  },
}

export default function LeadListsPage() {
  const { leadLists, updateLeadList, deleteLeadList, addLeadList } = useLeadListsStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [serverLists, setServerLists] = useState<LeadList[]>([])

  // Fetch from API on mount and periodically
  const fetchLists = useCallback(async () => {
    try {
      const response = await fetch('/api/lead-lists/webhook')
      const data = await response.json()
      if (data.success && data.lists) {
        setServerLists(data.lists)
        // Sync with local store
        data.lists.forEach((list: LeadList) => {
          const exists = leadLists.find(l => l.id === list.id)
          if (!exists) {
            // Add to local store (without triggering another add)
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch lead lists:', error)
    }
  }, [leadLists])

  useEffect(() => {
    fetchLists()
    // Poll every 30 seconds
    const interval = setInterval(fetchLists, 30000)
    return () => clearInterval(interval)
  }, [fetchLists])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchLists()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleMarkAsUploaded = async (id: string) => {
    updateLeadList(id, { 
      status: 'uploaded_to_launchcontrol',
      uploadedAt: new Date().toISOString()
    })
    // Also update server
    await fetch('/api/lead-lists/webhook', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id, 
        status: 'uploaded_to_launchcontrol',
        uploadedAt: new Date().toISOString()
      })
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/lead-lists/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove from local store
        deleteLeadList(id)
        // Remove from server lists state
        setServerLists(prev => prev.filter(l => l.id !== id))
      } else {
        console.error('Failed to delete:', data.error)
        alert(`Failed to delete: ${data.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete record')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch('/api/lead-lists/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cancel: true })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove from local store
        deleteLeadList(id)
        // Remove from server lists state
        setServerLists(prev => prev.filter(l => l.id !== id))
      } else {
        console.error('Failed to cancel:', data.error)
        alert(`Failed to cancel: ${data.error}`)
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel scrubbing')
    }
  }

  // Combine local and server lists, prioritizing local updates
  const allLists = [...leadLists]
  serverLists.forEach(serverList => {
    if (!allLists.find(l => l.id === serverList.id)) {
      allLists.push(serverList)
    }
  })

  // Sort by received date (newest first)
  const sortedLists = allLists.sort((a, b) => 
    new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  )

  const incomingCount = sortedLists.filter(l => l.status === 'incoming').length
  const readyCount = sortedLists.filter(l => l.status === 'ready').length
  const scrubbingCount = sortedLists.filter(l => l.status === 'scrubbing').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Lists</h1>
          <p className="text-muted-foreground">
            Incoming lead lists from LandPortal, ready for LaunchControl
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCwIcon className={`size-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <a href="/lead-lists/upload">
              <UploadCloudIcon className="size-4 mr-2" />
              Upload List
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Incoming</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{incomingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scrubbing</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{scrubbingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready for Upload</CardDescription>
            <CardTitle className="text-3xl text-green-600">{readyCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Lists</CardDescription>
            <CardTitle className="text-3xl">{sortedLists.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-5" />
            All Lead Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLists.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="size-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No lead lists yet</p>
              <p className="text-sm text-muted-foreground">
                Lists will appear here when received from LandPortal
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLists.map((list) => {
                  const status = statusConfig[list.status]
                  return (
                    <TableRow key={list.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheetIcon className="size-4 text-green-600" />
                          <div>
                            <div className="font-medium">{list.fileName}</div>
                            {list.originalFileName !== list.fileName && (
                              <div className="text-xs text-muted-foreground">
                                Original: {list.originalFileName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {list.county || list.state ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPinIcon className="size-3" />
                            {list.county && list.state 
                              ? `${list.county}, ${list.state}`
                              : list.county || list.state}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {list.recordCount ? (
                          <span className="font-medium">{list.recordCount.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          <span className="mr-1">{status.icon}</span>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="size-3" />
                          {new Date(list.receivedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(list.receivedAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {list.downloadUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={list.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <DownloadIcon className="size-4" />
                              </a>
                            </Button>
                          )}
                          {list.status === 'ready' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkAsUploaded(list.id)}
                            >
                              <UploadCloudIcon className="size-4 mr-1" />
                              Mark Uploaded
                            </Button>
                          )}
                          {list.status === 'scrubbing' ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-orange-500 hover:text-orange-600 border-orange-500/50 hover:border-orange-500">
                                  <XCircleIcon className="size-4 mr-1" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Scrubbing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel the scrubbing process for "{list.fileName}" and remove it from the list. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Scrubbing</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-orange-500 hover:bg-orange-600"
                                    onClick={() => handleCancel(list.id)}
                                  >
                                    Cancel Scrubbing
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                  <TrashIcon className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Lead List?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{list.fileName}" from the list. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(list.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
