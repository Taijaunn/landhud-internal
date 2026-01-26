'use client'

import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  ChartColumnStackedIcon,
  BookMarkedIcon,
  ClipboardListIcon,
  NotebookPenIcon,
  UsersIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
  CalendarIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

import LogoSvg from '@/assets/svg/logo'
import { RoleSelector } from '@/components/landhud/role-selector'
import { useUserStore } from '@/lib/data/store'
import type { UserRole } from '@/lib/types'

type MenuItem = {
  icon: ComponentType
  label: string
  href: string
  roles: UserRole[] // Which roles can see this menu item
}

const menuItems: MenuItem[] = [
  {
    icon: ChartColumnStackedIcon,
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['admin', 'sms_va', 'underwriter']
  },
  {
    icon: UsersIcon,
    label: 'Submit Lead',
    href: '/leads',
    roles: ['admin', 'sms_va']
  },
  {
    icon: SearchIcon,
    label: 'Valuations',
    href: '/valuations',
    roles: ['admin', 'underwriter']
  },
  {
    icon: BookMarkedIcon,
    label: 'Training',
    href: '/training',
    roles: ['admin', 'sms_va', 'underwriter']
  },
  {
    icon: NotebookPenIcon,
    label: 'EOD Report',
    href: '/eod-report',
    roles: ['admin', 'sms_va', 'underwriter']
  },
  {
    icon: CalendarIcon,
    label: 'Calendar',
    href: '/calendar',
    roles: ['admin', 'sms_va', 'underwriter']
  }
]

const adminItems: MenuItem[] = [
  {
    icon: ClipboardListIcon,
    label: 'All Leads',
    href: '/admin/leads',
    roles: ['admin']
  },
  {
    icon: SettingsIcon,
    label: 'Settings',
    href: '/admin/settings',
    roles: ['admin']
  }
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { currentRole, currentUserName } = useUserStore()

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentRole))
  const visibleAdminItems = adminItems.filter(item => item.roles.includes(currentRole))

  return (
    <div className="bg-muted flex min-h-dvh w-full">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="[&_[data-slot=sidebar-inner]]:bg-muted !border-r-0">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-2.5 !bg-transparent [&>svg]:size-8" asChild>
                  <Link href="/dashboard">
                    <LogoSvg className="[&_rect]:fill-muted [&_rect:first-child]:fill-primary" />
                    <span className="text-xl font-semibold">LandHud</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        tooltip={item.label} 
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {visibleAdminItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleAdminItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          tooltip={item.label} 
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="!bg-transparent">
                  <Avatar className="size-6">
                    <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                    <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{currentUserName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="bg-muted sticky top-0 z-50 flex items-center justify-between gap-6 px-4 py-2 sm:px-6 border-b border-border/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="[&_svg]:!size-5" />
              <Separator orientation="vertical" className="hidden !h-4 sm:block" />
              <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">
                LandHud Internal
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <RoleSelector />
              <Button variant="ghost" size="icon">
                <BellIcon className="size-4" />
              </Button>
            </div>
          </header>

          <main className="size-full flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>

          <footer className="flex items-center justify-center gap-3 px-4 py-3 sm:px-6 border-t border-border/50">
            <p className="text-muted-foreground text-sm text-balance text-center">
              © {new Date().getFullYear()} LandHud Internal
            </p>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  )
}
