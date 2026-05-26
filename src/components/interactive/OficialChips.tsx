import { MousePointerClick } from 'lucide-react'
import { colorPorScore } from '@/lib/colors'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { cn } from '@/lib/utils'

type OficialChipsProps = {
  oficiales: EvaluacionOficial[]
  selectedId?: string
  onSelect: (id: string) => void
  dark?: boolean
}

export function OficialChips({
  oficiales,
  selectedId,
  onSelect,
  dark = false,
}: OficialChipsProps) {
  if (oficiales.length === 0) {
    return (
      <p
        className={cn(
          'rounded-xl border border-dashed px-5 py-4 text-base',
          dark
            ? 'border-white/30 text-white/75'
            : 'border-navy/30 text-black/70',
        )}
      >
        No hay colaboradores en este filtro.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        dark
          ? 'border-white/20 bg-white/10'
          : 'border-navy/10 bg-white',
      )}
    >
      <div className="mb-4 flex items-start gap-2">
        <MousePointerClick
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0',
            dark ? 'text-white' : 'text-navy',
          )}
        />
        <p
          className={cn(
            'text-base font-bold sm:text-lg',
            dark ? 'text-white' : 'text-black',
          )}
        >
          Toca un colaborador para ver su evaluación 360
        </p>
      </div>
      <div className="chips-scroll flex gap-2.5 overflow-x-auto pb-2">
        {oficiales.map((o) => {
          const dotColor = o.sinEvaluar ? undefined : colorPorScore(o.desempeno)
          const apellido = o.nombre.split(' ').slice(0, 2).join(' ')
          const active = o.id === selectedId

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className={cn(
                'flex min-h-[4rem] min-w-[9rem] shrink-0 flex-col justify-center rounded-xl border px-4 py-3 text-left transition-all',
                active
                  ? 'border-white bg-white/20 text-white ring-2 ring-white/40'
                  : dark
                    ? 'border-white/20 bg-navy/40 text-white hover:bg-white/15'
                    : 'border-navy/12 bg-white text-black hover:border-navy/30',
              )}
            >
              <span className="flex items-center gap-2">
                {dotColor && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
                <span className="truncate text-sm font-bold sm:text-base">
                  {apellido}
                </span>
              </span>
              <span
                className={cn(
                  'mt-1 text-xl font-bold tabular-nums',
                  active ? 'text-white' : dark ? 'text-white' : 'text-black',
                )}
              >
                {o.sinEvaluar ? '—' : o.desempeno.toFixed(2)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
