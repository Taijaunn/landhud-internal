'use client'

import { useUserStore } from '@/lib/data/store'
import type { UserRole } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ShieldIcon, MessageSquareIcon, SearchIcon } from 'lucide-react'

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { 
    label: 'Admin', 
    icon: <ShieldIcon className="size-3.5" />,
    color: 'bg-chart-1/10 text-chart-1'
  },
  sms_va: { 
    label: 'SMS VA', 
    icon: <MessageSquareIcon className="size-3.5" />,
    color: 'bg-chart-2/10 text-chart-2'
  },
  underwriter: { 
    label: 'Underwriter', 
    icon: <SearchIcon className="size-3.5" />,
    color: 'bg-chart-3/10 text-chart-3'
  }
}

export function RoleSelector() {
  const { currentRole, setRole, currentUserName } = useUserStore()
  const config = roleConfig[currentRole]

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={config.color}>
        {config.icon}
        <span className="ml-1">{currentUserName}</span>
      </Badge>
      <Select value={currentRole} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-3.5" />
              Admin
            </div>
          </SelectItem>
          <SelectItem value="sms_va">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="size-3.5" />
              SMS VA
            </div>
          </SelectItem>
          <SelectItem value="underwriter">
            <div className="flex items-center gap-2">
              <SearchIcon className="size-3.5" />
              Underwriter
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
