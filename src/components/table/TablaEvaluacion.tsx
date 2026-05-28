import { useEffect, useMemo, useState } from 'react'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import { colorPorScore, COLORS } from '@/lib/colors'
import { getNivelDesempeno } from '@/lib/nomenclatura'
import { getEvaluados } from '@/lib/stats'
import { hrPanel, hrScrollArea } from '@/lib/dashboardStyles'
import { NivelTag } from '@/components/ui/ScoreBadge'
import { cn } from '@/lib/utils'

type TablaEvaluacionProps = {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  dark?: boolean
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || value <= 0) return '—'
  return value.toFixed(1)
}

function formatDesempeno(oficial: EvaluacionOficial): string {
  if (oficial.sinEvaluar || oficial.desempeno <= 0) return '—'
  return oficial.desempeno.toFixed(2)
}

export function TablaEvaluacion({
  oficiales,
  evaluadoresLabels,
  dark = false,
}: TablaEvaluacionProps) {
  const lista = useMemo(
    () =>
      [...oficiales].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [oficiales],
  )

  const evaluados = useMemo(() => getEvaluados(lista), [lista])

  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => evaluados[0]?.id ?? lista[0]?.id,
  )

  useEffect(() => {
    if (selectedId && lista.some((o) => o.id === selectedId)) return
    setSelectedId(evaluados[0]?.id ?? lista[0]?.id)
  }, [lista, evaluados, selectedId])

  const selected = useMemo(
    () => lista.find((o) => o.id === selectedId) ?? null,
    [lista, selectedId],
  )

  const columnas = useMemo(
    () => [
      ...EVALUADOR_KEYS.map((key: EvaluadorKey) => ({
        id: key,
        label: evaluadoresLabels[key],
      })),
      { id: 'ts', label: 'TS (Tactical Support)' },
    ],
    [evaluadoresLabels],
  )

  const listaBtn = (active: boolean) =>
    cn(
      'flex w-full flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-3',
      active
        ? dark
          ? 'border-sky-300/70 bg-sky-300/15 text-white ring-1 ring-sky-300/40'
          : 'border-navy bg-navy/5 text-navy ring-1 ring-navy/20'
        : dark
          ? 'border-white/12 bg-white/5 text-white/85 hover:border-white/25 hover:bg-white/10'
          : 'border-navy/10 bg-white text-navy hover:border-navy/20 hover:bg-surface',
    )

  const border = dark ? 'border-white/20' : 'border-navy/15'
  const thHead = cn(
    'eval-matrix-head border px-2 py-2 text-center text-[10px] font-bold uppercase leading-snug sm:px-3 sm:text-xs',
    border,
    'bg-navy text-white',
  )
  const tdData = cn(
    'eval-matrix-cell border px-2 py-2 text-center text-sm font-semibold tabular-nums sm:py-2.5 sm:text-base',
    border,
    dark ? 'bg-white/95 text-[#000b29]' : 'bg-white text-black',
  )

  return (
    <div className="grid min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,380px)_1fr] xl:grid-cols-[minmax(300px,420px)_1fr] lg:gap-5">
      {/* Lista colaboradores */}
      <div
        className={hrPanel(
          dark,
          'flex max-h-[480px] flex-col p-3 sm:max-h-[520px] sm:p-4 lg:max-h-none lg:h-[480px]',
        )}
      >
        <p
          className={cn(
            'mb-1 text-xs font-bold uppercase tracking-widest',
            dark ? 'text-white/55' : 'text-black/45',
          )}
        >
          Colaboradores evaluados
        </p>
        <p
          className={cn(
            'mb-3 text-xs sm:text-sm',
            dark ? 'text-white/50' : 'text-black/50',
          )}
        >
          {lista.length} en plantilla · selecciona uno para ver su evaluación
        </p>
        <div className={cn('min-h-0 flex-1 space-y-1.5', hrScrollArea(dark))}>
          {lista.map((oficial) => {
            const active = oficial.id === selectedId

            return (
              <button
                key={oficial.id}
                type="button"
                onClick={() => setSelectedId(oficial.id)}
                className={listaBtn(active)}
              >
                <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-xs font-semibold uppercase leading-snug sm:text-sm">
                  {oficial.nombre}
                </span>
                {oficial.sinEvaluar ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      dark ? 'bg-white/15 text-white/60' : 'bg-black/10 text-black/45',
                    )}
                  >
                    Pendiente
                  </span>
                ) : (
                  <span
                    className="shrink-0 rounded-md px-2 py-0.5 text-sm font-bold tabular-nums text-white"
                    style={{
                      backgroundColor: colorPorScore(oficial.desempeno),
                    }}
                  >
                    {oficial.desempeno.toFixed(2)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalle evaluación — un colaborador */}
      <div className={cn('eval-matrix flex min-h-[480px] flex-col', hrPanel(dark, 'p-0'))}>
        {!selected ? (
          <p
            className={cn(
              'm-auto px-4 py-16 text-center text-sm',
              dark ? 'text-white/60' : 'text-black/55',
            )}
          >
            Selecciona un colaborador de la lista.
          </p>
        ) : selected.sinEvaluar ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <p
              className={cn(
                'text-sm font-bold uppercase leading-snug sm:text-base',
                dark ? 'text-white' : 'text-navy',
              )}
            >
              {selected.nombre}
            </p>
            <p
              className={cn(
                'mt-3 text-sm',
                dark ? 'text-white/60' : 'text-black/55',
              )}
            >
              Sin evaluación registrada en el periodo.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              className={cn(
                'shrink-0 border-b px-4 py-3 sm:px-5 sm:py-4',
                dark ? 'border-white/15' : 'border-navy/10',
              )}
            >
              <p
                className={cn(
                  'text-sm font-bold uppercase leading-snug whitespace-normal break-words sm:text-base',
                  dark ? 'text-white' : 'text-navy',
                )}
              >
                {selected.nombre}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className="rounded-lg px-3 py-1 text-xl font-bold tabular-nums text-white sm:text-2xl"
                  style={{
                    backgroundColor: colorPorScore(selected.desempeno),
                  }}
                >
                  {formatDesempeno(selected)}
                </span>
                <NivelTag score={selected.desempeno} dark={dark} />
                <span
                  className={cn(
                    'text-xs sm:text-sm',
                    dark ? 'text-white/60' : 'text-black/50',
                  )}
                >
                  Desempeño final · escala 0–5
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4">
              <table className="w-full min-w-[520px] border-collapse">
                <thead>
                  <tr>
                    <th
                      className={cn(
                        thHead,
                        'min-w-[10rem] text-left sm:min-w-[12rem]',
                      )}
                    >
                      Evaluador
                    </th>
                    <th className={cn(thHead, 'min-w-[4rem]')}>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {columnas.map((col) => {
                    const score =
                      col.id === 'ts'
                        ? selected.ts
                        : selected.evaluadores[col.id as EvaluadorKey]
                    const val = score ?? 0
                    const color =
                      score !== null && score > 0
                        ? colorPorScore(val)
                        : undefined

                    return (
                      <tr key={col.id}>
                        <th
                          scope="row"
                          className={cn(
                            'eval-matrix-row-head border px-2 py-2 text-left text-[10px] font-semibold uppercase leading-snug sm:px-3 sm:text-xs',
                            border,
                            dark
                              ? 'bg-[#001a4d] text-white'
                              : 'bg-navy/[0.08] text-navy',
                          )}
                        >
                          <span className="block whitespace-normal break-words">
                            {col.label}
                          </span>
                        </th>
                        <td
                          className={tdData}
                          style={
                            color
                              ? {
                                  backgroundColor: color,
                                  color: COLORS.white,
                                }
                              : undefined
                          }
                        >
                          {formatScore(score)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <th
                      scope="row"
                      className={cn(
                        'eval-matrix-row-head border px-2 py-2 text-left text-xs font-bold uppercase sm:px-3',
                        border,
                        dark ? 'bg-[#001a4d] text-white' : 'bg-navy/10 text-navy',
                      )}
                    >
                      Desempeño
                    </th>
                    <td
                      className={cn(tdData, 'text-base font-bold')}
                      style={{
                        backgroundColor: colorPorScore(selected.desempeno),
                        color: COLORS.white,
                      }}
                      title={getNivelDesempeno(selected.desempeno).label}
                    >
                      {formatDesempeno(selected)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
