import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionBlockProps = {
  step?: number
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function SectionBlock({
  step,
  title,
  subtitle,
  children,
  className,
}: SectionBlockProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-navy/10 bg-white p-4 shadow-[0_4px_24px_-4px_rgba(0,11,41,0.06)] sm:p-6 lg:p-7',
        className,
      )}
    >
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
        {step !== undefined && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white shadow-sm">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold tracking-tight text-navy sm:text-xl lg:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-black/55 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  )
}
