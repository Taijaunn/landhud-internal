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
  CalendarIcon,
  FileSpreadsheetIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  GraduationCapIcon,
  ShieldIcon,
  DatabaseIcon,
  ContactIcon,
  KanbanIcon,
  MessageSquareIcon,
  CalculatorIcon,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import LogoSvg from '@/assets/svg/logo'
import { RoleSelector } from '@/components/landhud/role-selector'
import { useUserStore } from '@/lib/data/store'
import type { UserRole } from '@/lib/types'

type MenuItem = {
  icon: ComponentType
  label: string
  href: string
  roles: UserRole[]
}

type MenuSection = {
  icon: ComponentType
  label: string
  roles: UserRole[]
  items: MenuItem[]
}

// Organized menu sections
const menuSections: MenuSection[] = [
  {
    icon: ContactIcon,
    label: 'CRM',
    roles: ['admin', 'sms_va', 'underwriter'],
    items: [
      {
        icon: ChartColumnStackedIcon,
        label: 'Dashboard',
        href: '/crm',
        roles: ['admin', 'sms_va', 'underwriter']
      },
      {
        icon: UsersIcon,
        label: 'Leads',
        href: '/crm/leads',
        roles: ['admin', 'sms_va', 'underwriter']
      },
      {
        icon: KanbanIcon,
        label: 'Pipeline',
        href: '/crm/pipeline',
        roles: ['admin', 'sms_va']
      },
      {
        icon: CalculatorIcon,
        label: 'Comps',
        href: '/crm/comps',
        roles: ['admin', 'underwriter']
      }
    ]
  },
  {
    icon: BriefcaseIcon,
    label: 'Operations',
    roles: ['admin', 'sms_va'],
    items: [
      {
        icon: FileSpreadsheetIcon,
        label: 'Lead Lists',
        href: '/lead-lists',
        roles: ['admin', 'sms_va']
      }
    ]
  },
  {
    icon: FileTextIcon,
    label: 'Reports',
    roles: ['admin', 'sms_va', 'underwriter'],
    items: [
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
  },
  {
    icon: GraduationCapIcon,
    label: 'Resources',
    roles: ['admin', 'sms_va', 'underwriter'],
    items: [
      {
        icon: BookMarkedIcon,
        label: 'Training',
        href: '/training',
        roles: ['admin', 'sms_va', 'underwriter']
      }
    ]
  }
]

const adminSection: MenuSection = {
  icon: ShieldIcon,
  label: 'Admin',
  roles: ['admin'],
  items: [
    {
      icon: SettingsIcon,
      label: 'Settings',
      href: '/admin/settings',
      roles: ['admin']
    }
  ]
}

function CollapsibleSection({ 
  section, 
  pathname, 
  currentRole 
}: { 
  section: MenuSection
  pathname: string
  currentRole: UserRole
}) {
  const visibleItems = section.items.filter(item => item.roles.includes(currentRole))
  
  if (visibleItems.length === 0) return null
  
  // Check if any item in this section is active
  const isActive = visibleItems.some(item => pathname === item.href)
  
  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={section.label}>
            <section.icon />
            <span>{section.label}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {visibleItems.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton 
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { currentRole, currentUserName } = useUserStore()

  // Filter sections that have at least one visible item for current role
  const visibleSections = menuSections.filter(section => 
    section.roles.includes(currentRole) &&
    section.items.some(item => item.roles.includes(currentRole))
  )
  
  const showAdminSection = adminSection.roles.includes(currentRole) &&
    adminSection.items.some(item => item.roles.includes(currentRole))

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
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleSections.map((section) => (
                    <CollapsibleSection 
                      key={section.label}
                      section={section}
                      pathname={pathname}
                      currentRole={currentRole}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {showAdminSection && (
              <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <CollapsibleSection 
                      section={adminSection}
                      pathname={pathname}
                      currentRole={currentRole}
                    />
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
