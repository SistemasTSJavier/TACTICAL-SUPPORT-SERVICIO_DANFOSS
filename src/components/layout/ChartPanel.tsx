import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChartPanelProps = {
  title: string
  hint?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  dark?: boolean
  headerRight?: ReactNode
}

export function ChartPanel({
  title,
  hint,
  icon: Icon,
  children,
  className,
  dark = false,
  headerRight,
}: ChartPanelProps) {
  return (
    <Card
      className={cn(
        'h-full overflow-hidden rounded-2xl border border-navy/10 shadow-sm',
        dark &&
          'shadow-glow border-white/12 !bg-white/[0.06] text-white backdrop-blur-sm',
        className,
      )}
    >
      <CardHeader
        className={cn(
          'flex flex-row items-start justify-between gap-3 border-b px-4 py-4 sm:px-6 sm:py-5',
          dark ? 'border-white/15' : 'border-navy/10',
        )}
      >
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                dark
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-navy/15 bg-navy/5 text-navy',
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3
              className={cn(
                'text-base font-bold leading-snug sm:text-lg',
                dark ? 'text-white' : 'text-black',
              )}
            >
              {title}
            </h3>
            {hint && (
              <p
                className={cn(
                  'mt-1 text-sm leading-relaxed sm:text-base',
                  dark ? 'text-white/70' : 'text-black/60',
                )}
              >
                {hint}
              </p>
            )}
          </div>
        </div>
        {headerRight}
      </CardHeader>
      <CardContent className="px-4 py-4 sm:px-6 sm:py-5">{children}</CardContent>
    </Card>
  )
}
