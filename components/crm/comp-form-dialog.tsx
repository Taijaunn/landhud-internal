'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  Loader2Icon,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCRMStore } from '@/lib/data/crm-store'
import type { ComparableSale } from '@/lib/types/crm'

interface CompFormDialogProps {
  leadId: string
  propertyAcreage: number
  userId: string
  userName: string
  onSuccess?: () => void
  children?: React.ReactNode
}

interface ComparableSaleForm {
  address: string
  sale_price: string
  sale_date: string
  acreage: string
  distance_miles: string
}

export function CompFormDialog({
  leadId,
  propertyAcreage,
  userId,
  userName,
  onSuccess,
  children,
}: CompFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [compValue, setCompValue] = useState('')
  const [confidenceLevel, setConfidenceLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [methodology, setMethodology] = useState('')
  const [notes, setNotes] = useState('')
  const [comparableSales, setComparableSales] = useState<ComparableSaleForm[]>([
    { address: '', sale_price: '', sale_date: '', acreage: '', distance_miles: '' }
  ])

  const { addComp, fetchLead } = useCRMStore()
  const { toast } = useToast()

  const resetForm = () => {
    setCompValue('')
    setConfidenceLevel('medium')
    setMethodology('')
    setNotes('')
    setComparableSales([{ address: '', sale_price: '', sale_date: '', acreage: '', distance_miles: '' }])
  }

  const addComparableSale = () => {
    setComparableSales([
      ...comparableSales,
      { address: '', sale_price: '', sale_date: '', acreage: '', distance_miles: '' }
    ])
  }

  const removeComparableSale = (index: number) => {
    if (comparableSales.length > 1) {
      setComparableSales(comparableSales.filter((_, i) => i !== index))
    }
  }

  const updateComparableSale = (index: number, field: keyof ComparableSaleForm, value: string) => {
    const updated = [...comparableSales]
    updated[index] = { ...updated[index], [field]: value }
    setComparableSales(updated)
  }

  // Calculate average $/acre from comps
  const calculateAveragePricePerAcre = (): number | null => {
    const validComps = comparableSales.filter(
      c => c.sale_price && c.acreage && parseFloat(c.acreage) > 0
    )
    if (validComps.length === 0) return null
    
    const total = validComps.reduce((sum, c) => {
      const price = parseFloat(c.sale_price.replace(/[^0-9.]/g, ''))
      const acres = parseFloat(c.acreage)
      return sum + (price / acres)
    }, 0)
    
    return total / validComps.length
  }

  const suggestedValue = (): number | null => {
    const avgPPA = calculateAveragePricePerAcre()
    if (!avgPPA || !propertyAcreage) return null
    return Math.round(avgPPA * propertyAcreage)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!compValue) {
      toast({
        title: 'Missing Value',
        description: 'Please enter a comp value',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Parse comparable sales
      const parsedComps: ComparableSale[] = comparableSales
        .filter(c => c.address && c.sale_price)
        .map(c => {
          const price = parseFloat(c.sale_price.replace(/[^0-9.]/g, ''))
          const acres = parseFloat(c.acreage) || 0
          return {
            address: c.address,
            sale_price: price,
            sale_date: c.sale_date || format(new Date(), 'yyyy-MM-dd'),
            acreage: acres,
            price_per_acre: acres > 0 ? price / acres : 0,
            distance_miles: c.distance_miles ? parseFloat(c.distance_miles) : undefined
          }
        })

      const compValueNum = parseFloat(compValue.replace(/[^0-9.]/g, ''))

      await addComp({
        lead_id: leadId,
        comper_id: userId,
        comper_name: userName,
        comp_value: compValueNum,
        confidence_level: confidenceLevel,
        methodology: methodology || undefined,
        comparable_sales: parsedComps.length > 0 ? parsedComps : undefined,
        notes: notes || undefined,
      })

      toast({
        title: 'Comp Submitted',
        description: `Valuation of $${compValueNum.toLocaleString()} has been added`,
      })

      // Refresh lead data
      await fetchLead(leadId)
      
      resetForm()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting comp:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit comp. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggested = suggestedValue()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <PlusIcon className="size-4 mr-2" />
            Add Comp
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalculatorIcon className="size-5" />
            Submit Property Comp
          </DialogTitle>
          <DialogDescription>
            Add your valuation for this property based on comparable sales analysis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Valuation */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="compValue">Comp Value *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="compValue"
                    type="text"
                    placeholder="0"
                    value={compValue}
                    onChange={(e) => {
                      // Format as currency
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setCompValue(value ? parseInt(value).toLocaleString() : '')
                    }}
                    className="pl-7"
                    required
                  />
                </div>
                {suggested && (
                  <p className="text-xs text-muted-foreground">
                    Suggested based on comps: ${suggested.toLocaleString()}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs"
                      onClick={() => setCompValue(suggested.toLocaleString())}
                    >
                      Use this
                    </Button>
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Level</Label>
                <Select value={confidenceLevel} onValueChange={(v) => setConfidenceLevel(v as 'low' | 'medium' | 'high')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Strong comps, confident</SelectItem>
                    <SelectItem value="medium">Medium - Decent comps, some adjustment</SelectItem>
                    <SelectItem value="low">Low - Limited data, rough estimate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology</Label>
              <Input
                id="methodology"
                placeholder="e.g., Price per acre comparison, adjusted for road access"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
              />
            </div>
          </div>

          {/* Comparable Sales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Comparable Sales</Label>
              <Button type="button" variant="outline" size="sm" onClick={addComparableSale}>
                <PlusIcon className="size-3 mr-1" />
                Add Comp
              </Button>
            </div>
            
            <div className="space-y-4">
              {comparableSales.map((comp, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Comp #{index + 1}</span>
                    {comparableSales.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => removeComparableSale(index)}
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Property address"
                        value={comp.address}
                        onChange={(e) => updateComparableSale(index, 'address', e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        placeholder="Sale price"
                        value={comp.sale_price}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          updateComparableSale(index, 'sale_price', value ? parseInt(value).toLocaleString() : '')
                        }}
                        className="pl-7"
                      />
                    </div>
                    <Input
                      type="date"
                      value={comp.sale_date}
                      onChange={(e) => updateComparableSale(index, 'sale_date', e.target.value)}
                    />
                    <Input
                      placeholder="Acreage"
                      value={comp.acreage}
                      onChange={(e) => updateComparableSale(index, 'acreage', e.target.value)}
                    />
                    <Input
                      placeholder="Distance (miles)"
                      value={comp.distance_miles}
                      onChange={(e) => updateComparableSale(index, 'distance_miles', e.target.value)}
                    />
                  </div>
                  
                  {comp.sale_price && comp.acreage && parseFloat(comp.acreage) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ${(parseFloat(comp.sale_price.replace(/[^0-9.]/g, '')) / parseFloat(comp.acreage)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/acre
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {calculateAveragePricePerAcre() && (
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm font-medium text-blue-600">
                  Average: ${calculateAveragePricePerAcre()?.toLocaleString(undefined, { maximumFractionDigits: 0 })}/acre
                </p>
                <p className="text-xs text-muted-foreground">
                  × {propertyAcreage} acres = ${suggestedValue()?.toLocaleString()} suggested value
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes, concerns, or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Comp'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
