'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
  ArrowLeftIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

interface ProcessingStatus {
  status: UploadStatus
  progress: number
  message: string
  recordId?: string
  error?: string
}

export default function UploadLeadListPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [file, setFile] = useState<File | null>(null)
  const [county, setCounty] = useState('')
  const [state, setState] = useState('')
  const [notes, setNotes] = useState('')
  
  // Upload state
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  })
  
  const [isDragging, setIsDragging] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))
    if (!hasValidExtension) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
        error: 'Invalid file type',
      })
      return
    }
    
    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'File too large. Maximum size is 50MB.',
        error: 'File too large',
      })
      return
    }
    
    setFile(selectedFile)
    setProcessingStatus({ status: 'idle', progress: 0, message: '' })
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }, [handleFileSelect])

  // Remove selected file
  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setProcessingStatus({ status: 'idle', progress: 0, message: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Poll for status updates
  const pollStatus = useCallback(async (recordId: string) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/lead-lists/status?id=${recordId}`)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get status')
        }
        
        const record = data.record
        
        if (record.status === 'ready') {
          setProcessingStatus({
            status: 'complete',
            progress: 100,
            message: `Processing complete! ${record.record_count?.toLocaleString() || ''} records ready.`,
            recordId,
          })
          return
        }
        
        if (record.status === 'error') {
          setProcessingStatus({
            status: 'error',
            progress: 0,
            message: record.error_message || 'Processing failed',
            error: record.error_message,
            recordId,
          })
          return
        }
        
        // Still processing - continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setProcessingStatus({
            status: 'error',
            progress: 0,
            message: 'Processing timed out. Please check the list manually.',
            error: 'Timeout',
            recordId,
          })
        }
      } catch (error) {
        console.error('Status poll error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        }
      }
    }
    
    // Start polling after a short delay
    setTimeout(poll, 3000)
  }, [])

  // Submit form - uploads directly to Supabase, then calls API for record creation
  const handleSubmit = useCallback(async () => {
    if (!file || !county || !state) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'Please fill in all required fields',
        error: 'Missing required fields',
      })
      return
    }

    setProcessingStatus({
      status: 'uploading',
      progress: 10,
      message: 'Uploading file to storage...',
    })

    try {
      // Import supabase client dynamically to avoid SSR issues
      const { supabase } = await import('@/lib/supabase')
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
      const sanitizedCounty = county.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const sanitizedState = state.toLowerCase()
      const fileName = `${sanitizedCounty}-${sanitizedState}-${timestamp}${fileExtension}`

      setProcessingStatus({
        status: 'uploading',
        progress: 30,
        message: 'Uploading file to storage...',
      })

      // Upload directly to Supabase Storage (bypasses Vercel's 4.5MB limit)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lead-lists')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lead-lists')
        .getPublicUrl(fileName)

      const fileUrl = urlData?.publicUrl

      setProcessingStatus({
        status: 'uploading',
        progress: 60,
        message: 'Creating record and triggering processing...',
      })

      // Call lightweight API to create record and trigger N8N (no file in payload)
      const response = await fetch('/api/lead-lists/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileUrl,
          county,
          state,
          notes: notes || null,
          originalFilename: file.name,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create record')
      }

      setProcessingStatus({
        status: 'processing',
        progress: 80,
        message: 'File uploaded! Waiting for N8N to process...',
        recordId: data.recordId,
      })

      // Start polling for status
      pollStatus(data.recordId)

    } catch (error) {
      console.error('Upload error:', error)
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed',
        error: error instanceof Error ? error.message : 'Upload failed',
      })
    }
  }, [file, county, state, notes, pollStatus])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isProcessing = processingStatus.status === 'uploading' || processingStatus.status === 'processing'
  const canSubmit = file && county && state && !isProcessing

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/lead-lists')}>
          <ArrowLeftIcon className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Lead List</h1>
          <p className="text-muted-foreground">
            Upload a CSV from LandPortal for processing
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloudIcon className="size-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Drag and drop your CSV or Excel file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
              ${file ? 'border-green-500/50 bg-green-500/5' : ''}
              ${processingStatus.status === 'error' ? 'border-red-500/50 bg-red-500/5' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
              disabled={isProcessing}
            />
            
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheetIcon className="size-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  disabled={isProcessing}
                  className="ml-2"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <UploadCloudIcon className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="font-medium">
                  {isDragging ? 'Drop your file here' : 'Click or drag to upload'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV or Excel files (.csv, .xlsx, .xls), max 50MB
                </p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                placeholder="e.g., Heard County"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={state} onValueChange={setState} disabled={isProcessing}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this list..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isProcessing}
              rows={3}
            />
          </div>

          {/* Progress/Status */}
          {processingStatus.status !== 'idle' && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {processingStatus.status === 'uploading' && (
                  <LoaderIcon className="size-5 animate-spin text-primary" />
                )}
                {processingStatus.status === 'processing' && (
                  <LoaderIcon className="size-5 animate-spin text-yellow-500" />
                )}
                {processingStatus.status === 'complete' && (
                  <CheckCircleIcon className="size-5 text-green-500" />
                )}
                {processingStatus.status === 'error' && (
                  <AlertCircleIcon className="size-5 text-red-500" />
                )}
                <span className="font-medium">{processingStatus.message}</span>
              </div>
              
              {isProcessing && (
                <Progress value={processingStatus.progress} className="h-2" />
              )}
              
              {processingStatus.status === 'complete' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/lead-lists')}
                  className="mt-2"
                >
                  View All Lists
                </Button>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UploadCloudIcon className="size-4 mr-2" />
                Process List
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Export your list from LandPortal as CSV</li>
            <li>Upload the file and specify the county & state</li>
            <li>Click "Process List" - N8N will clean and skip-trace the data</li>
            <li>Once ready, download the clean list from the Lead Lists page</li>
            <li>Import into LaunchControl following the standard workflow</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
