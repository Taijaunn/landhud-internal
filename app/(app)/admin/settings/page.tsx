'use client'

import {
  SettingsIcon,
  DatabaseIcon,
  LinkIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your LandHud internal dashboard</p>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="size-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect external services to enable full functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cal.com */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Cal.com</p>
                <p className="text-sm text-muted-foreground">Book calls with sellers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Connected
              </Badge>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
          
          <Separator />
          
          {/* PandaDoc */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">P</span>
              </div>
              <div>
                <p className="font-medium">PandaDoc</p>
                <p className="text-sm text-muted-foreground">Send purchase agreements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                Not Connected
              </Badge>
              <Button size="sm">Connect</Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Close.com */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">C</span>
              </div>
              <div>
                <p className="font-medium">Close.com</p>
                <p className="text-sm text-muted-foreground">CRM integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                Not Connected
              </Badge>
              <Button size="sm">Connect</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="size-5" />
            Data Storage
          </CardTitle>
          <CardDescription>
            Currently using local browser storage. Connect a database for persistence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
              ⚠️ Data is stored in your browser
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Clearing browser data will erase all leads, reports, and training content.
              Connect Supabase for persistent, multi-user storage.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input
              id="supabaseUrl"
              placeholder="https://your-project.supabase.co"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
            <Input
              id="supabaseKey"
              type="password"
              placeholder="••••••••••••••••"
              disabled
            />
          </div>
          
          <Button disabled>
            Connect Supabase (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage user access and roles (requires authentication setup)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Taijaun</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
              <Badge>Owner</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-muted-foreground">+ Add team member</p>
              </div>
              <Button size="sm" disabled>Add User</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            User management requires authentication (Clerk or NextAuth). See PLAN_OF_ACTION.md for setup.
          </p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification settings will be available after authentication is configured.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
