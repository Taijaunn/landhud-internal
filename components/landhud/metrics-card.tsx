'use client'

import type { ReactNode } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface MetricsCardProps {
  icon: ReactNode
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  changePercentage?: string
  className?: string
  iconClassName?: string
  valuePrefix?: string
  valueSuffix?: string
}

export function MetricsCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  changePercentage,
  className,
  iconClassName,
  valuePrefix = '',
  valueSuffix = ''
}: MetricsCardProps) {
  return (
    <Card className={cn('gap-3', className)}>
      <CardHeader className="flex items-center justify-between pb-0">
        <Avatar className="size-10 rounded-lg">
          <AvatarFallback
            className={cn(
              'bg-primary/10 text-primary size-10 shrink-0 rounded-lg [&>svg]:size-5',
              iconClassName
            )}
          >
            {icon}
          </AvatarFallback>
        </Avatar>
        {trend && changePercentage && (
          <p className={cn(
            'flex items-center gap-0.5 text-sm font-medium',
            trend === 'up' && 'text-green-600 dark:text-green-400',
            trend === 'down' && 'text-red-600 dark:text-red-400'
          )}>
            {changePercentage}
            {trend === 'up' ? (
              <ChevronUpIcon className="size-4" />
            ) : trend === 'down' ? (
              <ChevronDownIcon className="size-4" />
            ) : null}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold tracking-tight">
          {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}{valueSuffix}
        </p>
        <p className="text-muted-foreground text-sm">{title}</p>
        {subtitle && (
          <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Large metrics card for important KPIs
export function LargeMetricsCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  changePercentage,
  className,
  iconClassName,
  valuePrefix = '',
  valueSuffix = ''
}: MetricsCardProps) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">
            {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}{valueSuffix}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Avatar className="size-12 rounded-xl">
          <AvatarFallback
            className={cn(
              'bg-primary/10 text-primary size-12 shrink-0 rounded-xl [&>svg]:size-6',
              iconClassName
            )}
          >
            {icon}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      {trend && changePercentage && (
        <CardContent className="pt-0">
          <p className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend === 'up' && 'text-green-600 dark:text-green-400',
            trend === 'down' && 'text-red-600 dark:text-red-400'
          )}>
            {trend === 'up' ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
            {changePercentage} from last week
          </p>
        </CardContent>
      )}
    </Card>
  )
}
