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
        hrPanel(dark, 'min-w-0 px-3 py-3 text-center sm:px-5 sm:py-5'),
        accent &&
          (dark
            ? '!border-sky-400/50 !bg-sky-400/20 shadow-md shadow-sky-900/20'
            : '!border-navy !bg-navy shadow-md'),
        className,
      )}
    >
      <p
        className={cn(
          'text-xl font-bold tabular-nums tracking-tight sm:text-3xl lg:text-4xl',
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
