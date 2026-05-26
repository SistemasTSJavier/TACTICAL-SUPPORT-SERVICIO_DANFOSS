import { COLORS, colorPorScore } from '@/lib/colors'
import { getNivelDesempeno } from '@/lib/nomenclatura'
import { cn } from '@/lib/utils'

type ScoreBadgeProps = {
  value: number | null
  className?: string
  large?: boolean
  dark?: boolean
}

export function ScoreBadge({
  value,
  className,
  large = false,
  dark = false,
}: ScoreBadgeProps) {
  if (value === null) {
    return (
      <span className={cn(dark ? 'text-white/40' : 'text-black/40')}>—</span>
    )
  }

  const nivel = getNivelDesempeno(value)
  const bg = colorPorScore(value)

  return (
    <span
      className={cn(
        'inline-block rounded-md px-2 py-0.5 font-bold tabular-nums text-white',
        large ? 'text-base sm:text-lg' : 'text-sm',
        className,
      )}
      style={{ backgroundColor: bg }}
      title={nivel.label}
    >
      {value.toFixed(2)}
    </span>
  )
}

export function NivelTag({
  score,
  className,
  dark = false,
}: {
  score: number
  className?: string
  dark?: boolean
}) {
  const nivel = getNivelDesempeno(score)
  const color = colorPorScore(score)

  return (
    <span
      className={cn(
        'rounded-md border px-2 py-0.5 text-xs font-bold uppercase sm:text-sm',
        className,
      )}
      style={{
        borderColor: color,
        backgroundColor: dark ? `${color}40` : `${color}20`,
        color: dark ? COLORS.white : color,
      }}
    >
      {nivel.label}
    </span>
  )
}
