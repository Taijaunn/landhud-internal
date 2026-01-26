'use client'

import { BellIcon, SearchIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

import { AppSidebar } from '@/components/layout/app-sidebar'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dropdown-notification'
import SearchDialog from '@/components/shadcn-studio/blocks/dialog-search'

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle: string
}

export function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  return (
    <div className='bg-muted flex min-h-dvh w-full'>
      <SidebarProvider>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <header className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-6 px-4 py-2 sm:px-6'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger className='[&_svg]:!size-5' />
              <Separator orientation='vertical' className='hidden !h-4 sm:block' />
              <SearchDialog
                trigger={
                  <>
                    <Button variant='ghost' className='hidden !bg-transparent px-1 py-0 font-normal sm:block'>
                      <div className='text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex'>
                        <SearchIcon />
                        <span>Type to search...</span>
                      </div>
                    </Button>
                    <Button variant='ghost' size='icon' className='sm:hidden'>
                      <SearchIcon />
                      <span className='sr-only'>Search</span>
                    </Button>
                  </>
                }
              />
            </div>
            <div className='flex items-center gap-1.5'>
              <NotificationDropdown
                trigger={
                  <Button variant='ghost' size='icon' className='relative'>
                    <BellIcon />
                    <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                  </Button>
                }
              />
              <ProfileDropdown
                trigger={
                  <Button variant='ghost' size='icon' className='size-9.5'>
                    <Avatar className='size-9.5 rounded-md'>
                      <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
            </div>
          </header>
          <main className='size-full flex-1 px-4 py-6 sm:px-6'>
            <div className='mb-6'>
              <h1 className='text-2xl font-semibold tracking-tight'>{pageTitle}</h1>
            </div>
            {children}
          </main>
          <footer className='flex items-center justify-center gap-3 px-4 py-3 sm:px-6'>
            <p className='text-muted-foreground text-sm text-balance text-center'>
              {`© ${new Date().getFullYear()}`} Landhud Internal
            </p>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  )
}
