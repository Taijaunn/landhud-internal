'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SendIcon, Loader2Icon, CheckCircle2Icon, FileTextIcon, PlusIcon, XIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'

import { supabase } from '@/lib/supabase'

interface FormData {
  // Seller Info
  sellerName: string
  sellerEmail: string
  hasSeller2: boolean
  seller2Name: string
  seller2Email: string
  // Property Info
  propertyAddress: string
  parcelId: string
  parcelCounty: string
  legalDescription: string
  // Deal Terms
  purchasePrice: string
  depositAmount: string
  depositDays: string
  isRefundable: string
  dueDiligence: string
  closingDate: string
  additionalTerms: string
  // Lead reference
  leadId?: string
}

interface FormErrors {
  sellerName?: { message: string }
  sellerEmail?: { message: string }
  seller2Name?: { message: string }
  seller2Email?: { message: string }
  propertyAddress?: { message: string }
  parcelId?: { message: string }
  parcelCounty?: { message: string }
  legalDescription?: { message: string }
  purchasePrice?: { message: string }
  depositAmount?: { message: string }
  depositDays?: { message: string }
  isRefundable?: { message: string }
  dueDiligence?: { message: string }
  closingDate?: { message: string }
}

const emptyFormData: FormData = {
  sellerName: '',
  sellerEmail: '',
  hasSeller2: false,
  seller2Name: '',
  seller2Email: '',
  propertyAddress: '',
  parcelId: '',
  parcelCounty: '',
  legalDescription: '',
  purchasePrice: '',
  depositAmount: '',
  depositDays: '3',
  isRefundable: 'is not',
  dueDiligence: '30',
  closingDate: '',
  additionalTerms: '',
  leadId: undefined
}

function SendContractPageContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId')
  
  const [formData, setFormData] = useState<FormData>(emptyFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadingLead, setLoadingLead] = useState(false)

  // Pre-fill form if leadId is provided
  useEffect(() => {
    if (leadId) {
      setLoadingLead(true)
      supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .single()
        .then(({ data: lead, error }) => {
          if (lead && !error) {
            setFormData(prev => ({
              ...prev,
              sellerName: `${lead.owner_first_name} ${lead.owner_last_name}`,
              sellerEmail: lead.owner_email || '',
              propertyAddress: `${lead.property_address}, ${lead.property_city}, ${lead.property_state} ${lead.property_zip || ''}`,
              parcelId: lead.apn,
              parcelCounty: lead.property_county,
              legalDescription: lead.legal_description || '',
              purchasePrice: lead.offer_price ? `$${lead.offer_price.toLocaleString()}` : '',
              leadId: lead.id
            }))
          }
          setLoadingLead(false)
        })
    }
  }, [leadId])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Seller validation
    if (!formData.sellerName.trim()) {
      newErrors.sellerName = { message: 'Seller name is required' }
    }
    if (!formData.sellerEmail.trim()) {
      newErrors.sellerEmail = { message: 'Seller email is required' }
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sellerEmail)) {
      newErrors.sellerEmail = { message: 'Please enter a valid email address' }
    }

    // Seller 2 validation (only if enabled)
    if (formData.hasSeller2) {
      if (!formData.seller2Name.trim()) {
        newErrors.seller2Name = { message: 'Seller 2 name is required' }
      }
      if (!formData.seller2Email.trim()) {
        newErrors.seller2Email = { message: 'Seller 2 email is required' }
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.seller2Email)) {
        newErrors.seller2Email = { message: 'Please enter a valid email address' }
      }
    }

    // Property validation
    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = { message: 'Property address is required' }
    }
    if (!formData.parcelId.trim()) {
      newErrors.parcelId = { message: 'Parcel ID is required' }
    }
    if (!formData.parcelCounty.trim()) {
      newErrors.parcelCounty = { message: 'County is required' }
    }

    // Deal terms validation
    if (!formData.purchasePrice.trim()) {
      newErrors.purchasePrice = { message: 'Purchase price is required' }
    }
    if (!formData.depositAmount.trim()) {
      newErrors.depositAmount = { message: 'Deposit amount is required' }
    }
    if (!formData.depositDays.trim()) {
      newErrors.depositDays = { message: 'Deposit days is required' }
    }
    if (!formData.isRefundable) {
      newErrors.isRefundable = { message: 'Please select refundable status' }
    }
    if (!formData.dueDiligence.trim()) {
      newErrors.dueDiligence = { message: 'Due diligence period is required' }
    }
    if (!formData.closingDate.trim()) {
      newErrors.closingDate = { message: 'Closing date is required' }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contracts/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send contract')
      }

      setShowSuccess(true)
      setFormData(emptyFormData)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d.]/g, '')
    if (!numbers) return ''
    const parts = numbers.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return '$' + parts.join('.')
  }

  const handleCurrencyChange = (field: 'purchasePrice' | 'depositAmount', value: string) => {
    const formatted = formatCurrency(value)
    handleInputChange(field, formatted)
  }

  if (loadingLead) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Send Contract</h1>
        <p className="text-muted-foreground">Send a Purchase & Sale Agreement via PandaDoc</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <FileTextIcon className="size-5" />
            </div>
            <div>
              <CardTitle>Purchase & Sale Agreement</CardTitle>
              <CardDescription>Fill in the details below to send a contract for signature</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seller Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Seller Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sellerName">Seller Name *</Label>
                  <Input
                    id="sellerName"
                    placeholder="John Smith"
                    value={formData.sellerName}
                    onChange={e => handleInputChange('sellerName', e.target.value)}
                    className={errors.sellerName ? 'border-destructive' : ''}
                  />
                  {errors.sellerName && <p className="text-xs text-destructive">{errors.sellerName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerEmail">Seller Email *</Label>
                  <Input
                    id="sellerEmail"
                    type="email"
                    placeholder="seller@example.com"
                    value={formData.sellerEmail}
                    onChange={e => handleInputChange('sellerEmail', e.target.value)}
                    className={errors.sellerEmail ? 'border-destructive' : ''}
                  />
                  {errors.sellerEmail && <p className="text-xs text-destructive">{errors.sellerEmail.message}</p>}
                </div>
              </div>

              {!formData.hasSeller2 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('hasSeller2', true)}
                >
                  <PlusIcon className="size-4 mr-1" />
                  Add Second Seller
                </Button>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Second Seller</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        handleInputChange('hasSeller2', false)
                        handleInputChange('seller2Name', '')
                        handleInputChange('seller2Email', '')
                      }}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="seller2Name">Seller 2 Name *</Label>
                      <Input
                        id="seller2Name"
                        placeholder="Jane Smith"
                        value={formData.seller2Name}
                        onChange={e => handleInputChange('seller2Name', e.target.value)}
                        className={errors.seller2Name ? 'border-destructive' : ''}
                      />
                      {errors.seller2Name && <p className="text-xs text-destructive">{errors.seller2Name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seller2Email">Seller 2 Email *</Label>
                      <Input
                        id="seller2Email"
                        type="email"
                        placeholder="seller2@example.com"
                        value={formData.seller2Email}
                        onChange={e => handleInputChange('seller2Email', e.target.value)}
                        className={errors.seller2Email ? 'border-destructive' : ''}
                      />
                      {errors.seller2Email && <p className="text-xs text-destructive">{errors.seller2Email.message}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Property Information</h3>

              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address *</Label>
                <Input
                  id="propertyAddress"
                  placeholder="123 Main St, City, State 12345"
                  value={formData.propertyAddress}
                  onChange={e => handleInputChange('propertyAddress', e.target.value)}
                  className={errors.propertyAddress ? 'border-destructive' : ''}
                />
                {errors.propertyAddress && <p className="text-xs text-destructive">{errors.propertyAddress.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parcelId">Parcel ID / APN *</Label>
                  <Input
                    id="parcelId"
                    placeholder="12-34-567-890"
                    value={formData.parcelId}
                    onChange={e => handleInputChange('parcelId', e.target.value)}
                    className={errors.parcelId ? 'border-destructive' : ''}
                  />
                  {errors.parcelId && <p className="text-xs text-destructive">{errors.parcelId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parcelCounty">County *</Label>
                  <Input
                    id="parcelCounty"
                    placeholder="Orange County"
                    value={formData.parcelCounty}
                    onChange={e => handleInputChange('parcelCounty', e.target.value)}
                    className={errors.parcelCounty ? 'border-destructive' : ''}
                  />
                  {errors.parcelCounty && <p className="text-xs text-destructive">{errors.parcelCounty.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalDescription">Legal Description</Label>
                <Textarea
                  id="legalDescription"
                  placeholder="Lot 1, Block 2, Subdivision Name, as recorded in..."
                  value={formData.legalDescription}
                  onChange={e => handleInputChange('legalDescription', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Deal Terms */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Deal Terms</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    placeholder="$50,000"
                    value={formData.purchasePrice}
                    onChange={e => handleCurrencyChange('purchasePrice', e.target.value)}
                    className={errors.purchasePrice ? 'border-destructive' : ''}
                  />
                  {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount *</Label>
                  <Input
                    id="depositAmount"
                    placeholder="$1,000"
                    value={formData.depositAmount}
                    onChange={e => handleCurrencyChange('depositAmount', e.target.value)}
                    className={errors.depositAmount ? 'border-destructive' : ''}
                  />
                  {errors.depositAmount && <p className="text-xs text-destructive">{errors.depositAmount.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="depositDays">Deposit Due (Days) *</Label>
                  <Input
                    id="depositDays"
                    placeholder="3"
                    value={formData.depositDays}
                    onChange={e => handleInputChange('depositDays', e.target.value.replace(/\D/g, ''))}
                    className={errors.depositDays ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">Days after signing</p>
                  {errors.depositDays && <p className="text-xs text-destructive">{errors.depositDays.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isRefundable">Deposit Refundable *</Label>
                  <Select
                    value={formData.isRefundable}
                    onValueChange={value => handleInputChange('isRefundable', value)}
                  >
                    <SelectTrigger className={errors.isRefundable ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is">Is Refundable</SelectItem>
                      <SelectItem value="is not">Is NOT Refundable</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.isRefundable && <p className="text-xs text-destructive">{errors.isRefundable.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDiligence">Due Diligence (Days) *</Label>
                  <Input
                    id="dueDiligence"
                    placeholder="30"
                    value={formData.dueDiligence}
                    onChange={e => handleInputChange('dueDiligence', e.target.value.replace(/\D/g, ''))}
                    className={errors.dueDiligence ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">Inspection period</p>
                  {errors.dueDiligence && <p className="text-xs text-destructive">{errors.dueDiligence.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Closing Date *</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={e => handleInputChange('closingDate', e.target.value)}
                  className={`w-full sm:w-auto ${errors.closingDate ? 'border-destructive' : ''}`}
                />
                {errors.closingDate && <p className="text-xs text-destructive">{errors.closingDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms">Additional Terms (Optional)</Label>
                <Textarea
                  id="additionalTerms"
                  placeholder="Any additional terms or conditions..."
                  value={formData.additionalTerms}
                  onChange={e => handleInputChange('additionalTerms', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">These terms will be added to the contract</p>
              </div>
            </div>

            {submitError && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(emptyFormData)
                  setErrors({})
                  setSubmitError(null)
                }}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    Send Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2Icon className="size-6" />
            </div>
            <AlertDialogTitle className="text-center">Contract Sent Successfully</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              The Purchase & Sale Agreement has been sent to the seller. They will receive an email with a link to review and sign the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Loading fallback for Suspense
function SendContractPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
      </div>
      <div className="max-w-3xl h-96 bg-muted rounded animate-pulse" />
    </div>
  )
}

// Default export with Suspense boundary
export default function SendContractPage() {
  return (
    <Suspense fallback={<SendContractPageSkeleton />}>
      <SendContractPageContent />
    </Suspense>
  )
}
