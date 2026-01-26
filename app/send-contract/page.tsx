'use client'

import { useState } from 'react'
import { SendIcon, Loader2Icon, CheckCircle2Icon, FileTextIcon, PlusIcon, XIcon } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend
} from '@/components/ui/field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'

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

// TODO: Remove test data before production
const initialFormData: FormData = {
  sellerName: 'John Seller',
  sellerEmail: 'taijaun@landhud.com', // Use your org email for sandbox testing
  hasSeller2: false,
  seller2Name: '',
  seller2Email: '',
  propertyAddress: '123 Test Property Lane, Austin, TX 78701',
  parcelId: '12-3456-789',
  parcelCounty: 'Travis County',
  legalDescription: 'Lot 15, Block 3, Test Subdivision, as recorded in Volume 123, Page 456',
  purchasePrice: '$75,000',
  depositAmount: '$2,500',
  depositDays: '3',
  isRefundable: 'is not',
  dueDiligence: '30',
  closingDate: '2026-03-15',
  additionalTerms: ''
}

export default function SendContractPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (!formData.legalDescription.trim()) {
      newErrors.legalDescription = { message: 'Legal description is required' }
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
      setFormData(initialFormData)
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

  return (
    <DashboardLayout pageTitle='Send a Contract'>
      <Card className='max-w-3xl'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg'>
              <FileTextIcon className='size-5' />
            </div>
            <div>
              <CardTitle>Purchase & Sale Agreement</CardTitle>
              <CardDescription>Send a PSA contract to the seller for signature via PandaDoc</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldSet>
              {/* Seller Information */}
              <FieldGroup>
                <FieldLegend>Seller Information</FieldLegend>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='sellerName'>Seller Name</FieldLabel>
                    <FieldContent>
                      <Input
                        id='sellerName'
                        placeholder='John Smith'
                        value={formData.sellerName}
                        onChange={e => handleInputChange('sellerName', e.target.value)}
                        aria-invalid={!!errors.sellerName}
                      />
                      <FieldError errors={errors.sellerName ? [errors.sellerName] : undefined} />
                    </FieldContent>
                  </Field>

                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='sellerEmail'>Seller Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id='sellerEmail'
                        type='email'
                        placeholder='seller@example.com'
                        value={formData.sellerEmail}
                        onChange={e => handleInputChange('sellerEmail', e.target.value)}
                        aria-invalid={!!errors.sellerEmail}
                      />
                      <FieldError errors={errors.sellerEmail ? [errors.sellerEmail] : undefined} />
                    </FieldContent>
                  </Field>
                </div>

                {!formData.hasSeller2 ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => handleInputChange('hasSeller2', true)}
                    className='w-fit'
                  >
                    <PlusIcon className='size-4' />
                    Add Second Seller
                  </Button>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Second Seller</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => {
                          handleInputChange('hasSeller2', false)
                          handleInputChange('seller2Name', '')
                          handleInputChange('seller2Email', '')
                        }}
                      >
                        <XIcon className='size-4' />
                      </Button>
                    </div>
                    <div className='grid gap-6 sm:grid-cols-2'>
                      <Field orientation='vertical'>
                        <FieldLabel htmlFor='seller2Name'>Seller 2 Name</FieldLabel>
                        <FieldContent>
                          <Input
                            id='seller2Name'
                            placeholder='Jane Smith'
                            value={formData.seller2Name}
                            onChange={e => handleInputChange('seller2Name', e.target.value)}
                            aria-invalid={!!errors.seller2Name}
                          />
                          <FieldError errors={errors.seller2Name ? [errors.seller2Name] : undefined} />
                        </FieldContent>
                      </Field>

                      <Field orientation='vertical'>
                        <FieldLabel htmlFor='seller2Email'>Seller 2 Email</FieldLabel>
                        <FieldContent>
                          <Input
                            id='seller2Email'
                            type='email'
                            placeholder='seller2@example.com'
                            value={formData.seller2Email}
                            onChange={e => handleInputChange('seller2Email', e.target.value)}
                            aria-invalid={!!errors.seller2Email}
                          />
                          <FieldError errors={errors.seller2Email ? [errors.seller2Email] : undefined} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>
                )}
              </FieldGroup>

              <Separator />

              {/* Property Information */}
              <FieldGroup>
                <FieldLegend>Property Information</FieldLegend>

                <Field orientation='vertical'>
                  <FieldLabel htmlFor='propertyAddress'>Property Address</FieldLabel>
                  <FieldContent>
                    <Input
                      id='propertyAddress'
                      placeholder='123 Main St, City, State 12345'
                      value={formData.propertyAddress}
                      onChange={e => handleInputChange('propertyAddress', e.target.value)}
                      aria-invalid={!!errors.propertyAddress}
                    />
                    <FieldError errors={errors.propertyAddress ? [errors.propertyAddress] : undefined} />
                  </FieldContent>
                </Field>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='parcelId'>Parcel ID</FieldLabel>
                    <FieldContent>
                      <Input
                        id='parcelId'
                        placeholder='12-34-567-890'
                        value={formData.parcelId}
                        onChange={e => handleInputChange('parcelId', e.target.value)}
                        aria-invalid={!!errors.parcelId}
                      />
                      <FieldError errors={errors.parcelId ? [errors.parcelId] : undefined} />
                    </FieldContent>
                  </Field>

                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='parcelCounty'>County</FieldLabel>
                    <FieldContent>
                      <Input
                        id='parcelCounty'
                        placeholder='Orange County'
                        value={formData.parcelCounty}
                        onChange={e => handleInputChange('parcelCounty', e.target.value)}
                        aria-invalid={!!errors.parcelCounty}
                      />
                      <FieldError errors={errors.parcelCounty ? [errors.parcelCounty] : undefined} />
                    </FieldContent>
                  </Field>
                </div>

                <Field orientation='vertical'>
                  <FieldLabel htmlFor='legalDescription'>Legal Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id='legalDescription'
                      placeholder='Lot 1, Block 2, Subdivision Name, as recorded in...'
                      value={formData.legalDescription}
                      onChange={e => handleInputChange('legalDescription', e.target.value)}
                      aria-invalid={!!errors.legalDescription}
                      className='min-h-20'
                    />
                    <FieldError errors={errors.legalDescription ? [errors.legalDescription] : undefined} />
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Separator />

              {/* Deal Terms */}
              <FieldGroup>
                <FieldLegend>Deal Terms</FieldLegend>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='purchasePrice'>Purchase Price</FieldLabel>
                    <FieldContent>
                      <Input
                        id='purchasePrice'
                        placeholder='$50,000'
                        value={formData.purchasePrice}
                        onChange={e => handleCurrencyChange('purchasePrice', e.target.value)}
                        aria-invalid={!!errors.purchasePrice}
                      />
                      <FieldError errors={errors.purchasePrice ? [errors.purchasePrice] : undefined} />
                    </FieldContent>
                  </Field>

                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='depositAmount'>Deposit Amount</FieldLabel>
                    <FieldContent>
                      <Input
                        id='depositAmount'
                        placeholder='$1,000'
                        value={formData.depositAmount}
                        onChange={e => handleCurrencyChange('depositAmount', e.target.value)}
                        aria-invalid={!!errors.depositAmount}
                      />
                      <FieldError errors={errors.depositAmount ? [errors.depositAmount] : undefined} />
                    </FieldContent>
                  </Field>
                </div>

                <div className='grid gap-6 sm:grid-cols-3'>
                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='depositDays'>Deposit Due (Days)</FieldLabel>
                    <FieldContent>
                      <Input
                        id='depositDays'
                        placeholder='3'
                        value={formData.depositDays}
                        onChange={e => handleInputChange('depositDays', e.target.value.replace(/\D/g, ''))}
                        aria-invalid={!!errors.depositDays}
                      />
                      <FieldDescription>Days after signing</FieldDescription>
                      <FieldError errors={errors.depositDays ? [errors.depositDays] : undefined} />
                    </FieldContent>
                  </Field>

                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='isRefundable'>Deposit Refundable</FieldLabel>
                    <FieldContent>
                      <Select
                        value={formData.isRefundable}
                        onValueChange={value => handleInputChange('isRefundable', value)}
                      >
                        <SelectTrigger
                          id='isRefundable'
                          className='w-full'
                          aria-invalid={!!errors.isRefundable}
                        >
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='is'>Is Refundable</SelectItem>
                          <SelectItem value='is not'>Is NOT Refundable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.isRefundable ? [errors.isRefundable] : undefined} />
                    </FieldContent>
                  </Field>

                  <Field orientation='vertical'>
                    <FieldLabel htmlFor='dueDiligence'>Due Diligence (Days)</FieldLabel>
                    <FieldContent>
                      <Input
                        id='dueDiligence'
                        placeholder='30'
                        value={formData.dueDiligence}
                        onChange={e => handleInputChange('dueDiligence', e.target.value.replace(/\D/g, ''))}
                        aria-invalid={!!errors.dueDiligence}
                      />
                      <FieldDescription>Inspection period</FieldDescription>
                      <FieldError errors={errors.dueDiligence ? [errors.dueDiligence] : undefined} />
                    </FieldContent>
                  </Field>
                </div>

                <Field orientation='vertical'>
                  <FieldLabel htmlFor='closingDate'>Closing Date</FieldLabel>
                  <FieldContent>
                    <Input
                      id='closingDate'
                      type='date'
                      value={formData.closingDate}
                      onChange={e => handleInputChange('closingDate', e.target.value)}
                      aria-invalid={!!errors.closingDate}
                      className='w-full sm:w-auto'
                    />
                    <FieldError errors={errors.closingDate ? [errors.closingDate] : undefined} />
                  </FieldContent>
                </Field>

                <Field orientation='vertical'>
                  <FieldLabel htmlFor='additionalTerms'>Additional Terms (Optional)</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id='additionalTerms'
                      placeholder='Any additional terms or conditions...'
                      value={formData.additionalTerms}
                      onChange={e => handleInputChange('additionalTerms', e.target.value)}
                      className='min-h-24'
                    />
                    <FieldDescription>These terms will be added to the contract</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>

              {submitError && (
                <div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>
                  {submitError}
                </div>
              )}

              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setFormData(initialFormData)
                    setErrors({})
                    setSubmitError(null)
                  }}
                >
                  Clear Form
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className='animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon />
                      Send Contract
                    </>
                  )}
                </Button>
              </div>
            </FieldSet>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
              <CheckCircle2Icon className='size-8' />
            </AlertDialogMedia>
            <AlertDialogTitle>Contract Sent Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              The Purchase & Sale Agreement has been sent to the seller. They will receive an email with a link to review and sign the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
