'use client'

import {
  BookMarkedIcon,
  ChartColumnStackedIcon,
  ClipboardListIcon,
  NotebookPenIcon
} from 'lucide-react'
import { usePathname } from 'next/navigation'

import LogoSvg from '@/assets/svg/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard-shell-06',
    icon: ChartColumnStackedIcon
  },
  {
    title: 'Internal Training',
    href: '/internal-training',
    icon: BookMarkedIcon
  },
  {
    title: 'Send a Contract',
    href: '/send-contract',
    icon: ClipboardListIcon
  },
  {
    title: 'Submit EOD Report',
    href: '/submit-eod-report',
    icon: NotebookPenIcon
  }
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon' className='[&_[data-slot=sidebar-inner]]:bg-muted !border-r-0'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
              <a href='/dashboard-shell-06'>
                <LogoSvg className='[&_rect]:fill-muted [&_rect:first-child]:fill-primary' />
                <span className='text-xl font-semibold'>Landhud</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Landhud Internal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.href}>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
