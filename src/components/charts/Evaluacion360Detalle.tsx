import { ClipboardList } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { NivelTag } from '@/components/ui/ScoreBadge'
import { colorPorScore } from '@/lib/colors'
import { promedioGrupoPorEvaluador, promedioDesempeno } from '@/lib/stats'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import { cn } from '@/lib/utils'

type Evaluacion360DetalleProps = {
  oficial: EvaluacionOficial | null
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  dark?: boolean
}

function shortLabel(full: string) {
  const p = full.split(' ')
  return p.length >= 2 ? `${p[0]} ${p[1]}` : full
}

export function Evaluacion360Detalle({
  oficial,
  oficiales,
  evaluadoresLabels,
  dark = false,
}: Evaluacion360DetalleProps) {
  const promedios = useMemo(
    () => promedioGrupoPorEvaluador(oficiales),
    [oficiales],
  )

  const promedioServicio = promedioDesempeno(oficiales)
  const evaluadosConTs = oficiales.filter((o) => !o.sinEvaluar && o.ts)
  const promedioTs =
    evaluadosConTs.reduce((a, o) => a + (o.ts ?? 0), 0) /
    Math.max(1, evaluadosConTs.length)

  const filas = useMemo(() => {
    if (!oficial || oficial.sinEvaluar) return []

    const items: {
      key: string
      label: string
      valor: number
      promedioRef: number
    }[] = []

    for (const k of EVALUADOR_KEYS) {
      const v = oficial.evaluadores[k]
      if (v !== null && v > 0) {
        items.push({
          key: k,
          label: evaluadoresLabels[k as EvaluadorKey],
          valor: v,
          promedioRef: promedios[k as EvaluadorKey],
        })
      }
    }
    if (oficial.ts !== null && oficial.ts > 0) {
      items.push({
        key: 'ts',
        label: 'TS (Tactical Support)',
        valor: oficial.ts,
        promedioRef: promedioTs,
      })
    }
    return items
  }, [oficial, evaluadoresLabels, promedios, promedioTs])

  return (
    <ChartPanel
      title="Lectura 360 del colaborador"
      hint="Cada barra es la calificación de un evaluador. La marca vertical es el promedio del servicio."
      icon={ClipboardList}
      dark={dark}
    >
      {!oficial || oficial.sinEvaluar ? (
        <p
          className={cn(
            'rounded-xl border border-dashed px-5 py-8 text-center text-base',
            dark
              ? 'border-white/30 text-white/80'
              : 'border-navy/25 text-black/55',
          )}
        >
          Selecciona un colaborador para ver cómo lo calificó cada evaluador.
        </p>
      ) : (
        <div className="space-y-5">
          <div
            className={cn(
              'rounded-xl border px-4 py-3 sm:px-5 sm:py-4',
              dark
                ? 'border-white/20 bg-white/10'
                : 'border-navy/20 bg-black/[0.03]',
            )}
          >
            <p
              className={cn(
                'text-sm font-medium sm:text-base',
                dark ? 'text-white/80' : 'text-black/55',
              )}
            >
              Puntaje final de desempeño
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-3">
              <span
                className={cn(
                  'text-3xl font-bold tabular-nums sm:text-4xl',
                  dark ? 'text-white' : 'text-black',
                )}
              >
                {oficial.desempeno.toFixed(2)}
              </span>
              <span
                className={cn(
                  'text-base sm:text-lg',
                  dark ? 'text-white/70' : 'text-black/55',
                )}
              >
                / 5
              </span>
              <NivelTag score={oficial.desempeno} dark={dark} />
            </p>
            <p
              className={cn(
                'mt-2 text-sm sm:text-base',
                dark ? 'text-white/75' : 'text-black/55',
              )}
            >
              Promedio del servicio: {promedioServicio.toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            {filas.map((f) => {
              const barColor = colorPorScore(f.valor)
              const pct = (f.valor / 5) * 100
              const pctRef = (f.promedioRef / 5) * 100

              return (
                <div
                  key={f.key}
                  className={cn(
                    'rounded-xl border p-4 sm:p-5',
                    dark
                      ? 'border-white/15 bg-white/5'
                      : 'border-navy/10 bg-white',
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-base font-bold leading-snug sm:text-lg',
                          dark ? 'text-white' : 'text-black',
                        )}
                      >
                        {shortLabel(f.label)}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-sm sm:text-base',
                          dark ? 'text-white/70' : 'text-black/55',
                        )}
                      >
                        Promedio servicio:{' '}
                        <strong className={dark ? 'text-white' : 'text-black'}>
                          {f.promedioRef.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span
                        className={cn(
                          'text-2xl font-bold tabular-nums sm:text-3xl',
                          dark ? 'text-white' : 'text-black',
                        )}
                      >
                        {f.valor.toFixed(2)}
                      </span>
                      <NivelTag score={f.valor} dark={dark} />
                    </div>
                  </div>

                  <div
                    className={cn(
                      'relative mt-4 h-3 overflow-hidden rounded-full',
                      dark ? 'bg-white/20' : 'bg-black/10',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0 z-10 h-full w-0.5',
                        dark ? 'bg-white' : 'bg-black/50',
                      )}
                      style={{ left: `${pctRef}%` }}
                      title={`Promedio servicio ${f.promedioRef.toFixed(2)}`}
                    />
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ChartPanel>
  )
}
