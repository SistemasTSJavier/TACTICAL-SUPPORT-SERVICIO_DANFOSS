import { Users } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { NivelTag } from '@/components/ui/ScoreBadge'
import { colorPorScore } from '@/lib/colors'
import { rankingOficiales } from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { cn } from '@/lib/utils'

export type RankingLeaderboardProps = {
  oficiales: EvaluacionOficial[]
  selectedId?: string
  onSelect?: (id: string) => void
  limit?: number
  maxHeight?: number
  dark?: boolean
}

function formatNombre(nombre: string) {
  const parts = nombre.split(' ')
  if (parts.length <= 2) return nombre
  return `${parts[0]} ${parts[1]}`
}

export function RankingLeaderboard({
  oficiales,
  selectedId,
  onSelect,
  limit,
  maxHeight = 560,
  dark = false,
}: RankingLeaderboardProps) {
  const lista = useMemo(() => {
    const sorted = rankingOficiales(oficiales)
    return limit ? sorted.slice(0, limit) : sorted
  }, [oficiales, limit])

  return (
    <ChartPanel
      title="Resultados por colaborador"
      hint="Selecciona un nombre para ver su evaluación 360"
      icon={Users}
      dark={dark}
    >
      <div
        style={{ maxHeight }}
        className="space-y-2 overflow-y-auto pr-1 sm:space-y-2.5"
      >
        {lista.map((oficial, index) => {
          const barColor = colorPorScore(oficial.desempeno)
          const active = oficial.id === selectedId
          const pct = (oficial.desempeno / 5) * 100

          return (
            <button
              key={oficial.id}
              type="button"
              onClick={() => onSelect?.(oficial.id)}
              className={cn(
                'grid w-full grid-cols-1 gap-3 rounded-xl border p-4 text-left transition-all sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4 sm:p-5',
                active
                  ? 'border-navy bg-navy text-white ring-2 ring-navy'
                  : dark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10'
                    : 'border-navy/15 bg-white hover:border-navy/30',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold tabular-nums sm:h-11 sm:w-11',
                  active
                    ? 'bg-white text-navy'
                    : dark
                      ? 'border border-white/20 text-white'
                      : 'border border-navy/15 text-black/60',
                )}
              >
                {index + 1}
              </span>

              <div className="min-w-0">
                <p
                  className={cn(
                    'text-base font-bold leading-snug sm:text-lg',
                    active ? 'text-white' : dark ? 'text-white' : 'text-black',
                  )}
                >
                  {formatNombre(oficial.nombre)}
                </p>
                <div
                  className={cn(
                    'mt-2 h-2.5 overflow-hidden rounded-full',
                    active ? 'bg-white/20' : 'bg-black/10',
                  )}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <span
                  className={cn(
                    'text-2xl font-bold tabular-nums sm:text-3xl',
                    active ? 'text-white' : dark ? 'text-white' : 'text-black',
                  )}
                >
                  {oficial.desempeno.toFixed(2)}
                </span>
                <NivelTag score={oficial.desempeno} dark={dark} />
              </div>
            </button>
          )
        })}
      </div>

      <p
        className={cn(
          'mt-4 border-t pt-3 text-sm leading-relaxed sm:text-base',
          dark ? 'border-white/15 text-white/60' : 'border-navy/10 text-black/60',
        )}
      >
        Haz clic en un nombre para profundizar en su evaluación 360 en la siguiente
        diapositiva.
      </p>
    </ChartPanel>
  )
}
