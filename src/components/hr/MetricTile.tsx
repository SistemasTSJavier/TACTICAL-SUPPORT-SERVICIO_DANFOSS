import { cn } from '@/lib/utils'
import { hrPanel } from '@/lib/dashboardStyles'

type MetricTileProps = {
  value: string
  label: string
  dark?: boolean
  accent?: boolean
  className?: string
}

export function MetricTile({
  value,
  label,
  dark = false,
  accent = false,
  className,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        hrPanel(dark, 'px-4 py-4 text-center sm:px-5 sm:py-5'),
        accent &&
          (dark
            ? '!border-white/25 !bg-white/12'
            : '!border-navy !bg-navy shadow-md'),
        className,
      )}
    >
      <p
        className={cn(
          'text-2xl font-bold tabular-nums tracking-tight sm:text-3xl lg:text-4xl',
          dark || accent
            ? accent && !dark
              ? 'text-white'
              : 'text-white'
            : 'text-navy',
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'mt-1.5 text-xs font-semibold uppercase tracking-wider sm:text-sm',
          dark || (accent && !dark)
            ? 'text-white/75'
            : 'text-black/55',
        )}
      >
        {label}
      </p>
    </div>
  )
}
