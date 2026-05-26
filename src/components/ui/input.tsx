import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-navy/25 bg-white px-3 py-2 text-base text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
        className,
      )}
      {...props}
    />
  )
}
