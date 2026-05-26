import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionProps = {
  id?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Section({
  id,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn('space-y-4', className)}>
      <div className="border-l-4 border-zinc-900 pl-4">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-600">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
