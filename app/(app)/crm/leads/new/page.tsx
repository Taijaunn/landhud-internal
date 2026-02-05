'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useUserStore } from '@/lib/data/store'
import { LEAD_SOURCES, type LeadSource } from '@/lib/types/crm'

export default function NewLeadPage() {
  const router = useRouter()
  const { createLead } = useCRMStore()
  const { currentUserId, currentUserName } = useUserStore()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Owner Info
    owner_first_name: '',
    owner_last_name: '',
    owner_phone: '',
    owner_phone_2: '',
    owner_email: '',
    
    // Mailing Address
    mailing_address: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: '',
    
    // Property Info
    property_address: '',
    property_city: '',
    property_state: '',
    property_county: '',
    property_zip: '',
    apn: '',
    
    // Property Details
    acreage: '',
    zoning: '',
    land_use: '',
    
    // Financial
    asking_price: '',
    
    // Source
    source: 'cold_sms' as LeadSource,
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.owner_first_name || !formData.owner_last_name || !formData.owner_phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in owner name and phone number.',
        variant: 'destructive',
      })
      return
    }
    
    if (!formData.property_address || !formData.property_city || !formData.property_state || !formData.property_county || !formData.apn) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in property address, city, state, county, and APN.',
        variant: 'destructive',
      })
      return
    }
    
    if (!formData.acreage) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the acreage.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const lead = await createLead({
        ...formData,
        acreage: parseFloat(formData.acreage),
        asking_price: formData.asking_price ? parseFloat(formData.asking_price) : undefined,
        created_by: currentUserId,
        stage: 'new',
        is_hot: false,
        is_starred: false,
        do_not_contact: false,
        notes_count: 0,
        activities_count: 0,
      })

      if (lead) {
        toast({
          title: 'Lead Created',
          description: 'The lead has been added to your pipeline.',
        })
        router.push(`/crm/leads/${lead.id}`)
      } else {
        throw new Error('Failed to create lead')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm/leads">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add New Lead</h1>
          <p className="text-muted-foreground">Enter the lead information below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner Information</CardTitle>
            <CardDescription>Contact details for the property owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="owner_first_name">First Name *</Label>
                <Input
                  id="owner_first_name"
                  value={formData.owner_first_name}
                  onChange={(e) => handleChange('owner_first_name', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_last_name">Last Name *</Label>
                <Input
                  id="owner_last_name"
                  value={formData.owner_last_name}
                  onChange={(e) => handleChange('owner_last_name', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Phone Number *</Label>
                <Input
                  id="owner_phone"
                  type="tel"
                  value={formData.owner_phone}
                  onChange={(e) => handleChange('owner_phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone_2">Secondary Phone</Label>
                <Input
                  id="owner_phone_2"
                  type="tel"
                  value={formData.owner_phone_2}
                  onChange={(e) => handleChange('owner_phone_2', e.target.value)}
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="owner_email">Email</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => handleChange('owner_email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mailing Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mailing Address</CardTitle>
            <CardDescription>Owner's mailing address (if different from property)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mailing_address">Street Address</Label>
              <Input
                id="mailing_address"
                value={formData.mailing_address}
                onChange={(e) => handleChange('mailing_address', e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mailing_city">City</Label>
                <Input
                  id="mailing_city"
                  value={formData.mailing_city}
                  onChange={(e) => handleChange('mailing_city', e.target.value)}
                  placeholder="Atlanta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_state">State</Label>
                <Input
                  id="mailing_state"
                  value={formData.mailing_state}
                  onChange={(e) => handleChange('mailing_state', e.target.value)}
                  placeholder="GA"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_zip">ZIP Code</Label>
                <Input
                  id="mailing_zip"
                  value={formData.mailing_zip}
                  onChange={(e) => handleChange('mailing_zip', e.target.value)}
                  placeholder="30301"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property Information</CardTitle>
            <CardDescription>Details about the property being acquired</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property_address">Property Address *</Label>
              <Input
                id="property_address"
                value={formData.property_address}
                onChange={(e) => handleChange('property_address', e.target.value)}
                placeholder="123 Rural Road"
                required
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="property_city">City *</Label>
                <Input
                  id="property_city"
                  value={formData.property_city}
                  onChange={(e) => handleChange('property_city', e.target.value)}
                  placeholder="Smalltown"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_state">State *</Label>
                <Input
                  id="property_state"
                  value={formData.property_state}
                  onChange={(e) => handleChange('property_state', e.target.value)}
                  placeholder="GA"
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_county">County *</Label>
                <Input
                  id="property_county"
                  value={formData.property_county}
                  onChange={(e) => handleChange('property_county', e.target.value)}
                  placeholder="Fulton"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_zip">ZIP Code</Label>
                <Input
                  id="property_zip"
                  value={formData.property_zip}
                  onChange={(e) => handleChange('property_zip', e.target.value)}
                  placeholder="30301"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apn">APN (Parcel Number) *</Label>
                <Input
                  id="apn"
                  value={formData.apn}
                  onChange={(e) => handleChange('apn', e.target.value)}
                  placeholder="123-456-789"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acreage">Acreage *</Label>
                <Input
                  id="acreage"
                  type="number"
                  step="0.01"
                  value={formData.acreage}
                  onChange={(e) => handleChange('acreage', e.target.value)}
                  placeholder="5.00"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zoning">Zoning</Label>
                <Input
                  id="zoning"
                  value={formData.zoning}
                  onChange={(e) => handleChange('zoning', e.target.value)}
                  placeholder="Residential"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="land_use">Land Use</Label>
                <Input
                  id="land_use"
                  value={formData.land_use}
                  onChange={(e) => handleChange('land_use', e.target.value)}
                  placeholder="Vacant"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Details</CardTitle>
            <CardDescription>Source and pricing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LEAD_SOURCES) as LeadSource[]).map((source) => (
                      <SelectItem key={source} value={source}>
                        {LEAD_SOURCES[source].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asking_price">Asking Price</Label>
                <Input
                  id="asking_price"
                  type="number"
                  value={formData.asking_price}
                  onChange={(e) => handleChange('asking_price', e.target.value)}
                  placeholder="25000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/crm/leads">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2Icon className="size-4 mr-2 animate-spin" />}
            Create Lead
          </Button>
        </div>
      </form>
    </div>
  )
}
