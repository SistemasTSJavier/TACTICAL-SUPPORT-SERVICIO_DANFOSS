import { useMemo } from 'react'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import { colorPorScore, COLORS } from '@/lib/colors'
import { getNivelDesempeno } from '@/lib/nomenclatura'
import { hrPanel } from '@/lib/dashboardStyles'
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
  const columnas = useMemo(
    () => [
      ...EVALUADOR_KEYS.map((key: EvaluadorKey) => ({
        id: key,
        label: evaluadoresLabels[key],
      })),
      { id: 'ts', label: 'TS' },
    ],
    [evaluadoresLabels],
  )

  const border = dark ? 'border-white/20' : 'border-navy/15'
  const thHead = cn(
    'eval-matrix-head sticky z-20 border px-2 py-2 text-center text-[10px] font-bold uppercase leading-snug sm:px-3 sm:text-xs',
    border,
    dark ? 'bg-navy text-white' : 'bg-navy text-white',
  )
  const thRow = cn(
    'eval-matrix-row-head sticky left-0 z-10 border px-2 py-1.5 text-left text-[10px] font-semibold uppercase leading-snug sm:px-3 sm:py-2 sm:text-xs',
    border,
    dark
      ? 'bg-[#001a4d] text-white'
      : 'bg-navy/[0.08] text-navy',
  )
  const tdData = cn(
    'eval-matrix-cell border px-2 py-1.5 text-center text-sm tabular-nums sm:py-2',
    border,
    dark ? 'bg-white/95 text-[#000b29]' : 'bg-white text-black',
  )

  return (
    <div className={cn('eval-matrix overflow-x-auto', hrPanel(dark, 'p-0'))}>
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            <th
              className={cn(
                thHead,
                'left-0 min-w-[11rem] sm:min-w-[13rem]',
              )}
            />
            {columnas.map((col) => (
              <th
                key={col.id}
                className={cn(thHead, 'min-w-[5.5rem] whitespace-normal')}
              >
                <span className="block leading-snug">{col.label}</span>
              </th>
            ))}
            <th className={cn(thHead, 'min-w-[5rem] whitespace-normal')}>
              Desempeño
            </th>
          </tr>
        </thead>
        <tbody>
          {oficiales.map((oficial) => {
            const tieneDesempeno =
              !oficial.sinEvaluar && oficial.desempeno > 0
            const nivel = tieneDesempeno
              ? getNivelDesempeno(oficial.desempeno)
              : null

            return (
              <tr
                key={oficial.id}
                className={
                  oficial.sinEvaluar
                    ? dark
                      ? 'bg-white/5'
                      : 'bg-black/[0.03]'
                    : undefined
                }
              >
                <th scope="row" className={cn(thRow, 'min-w-[11rem] sm:min-w-[13rem]')}>
                  <span className="block whitespace-normal break-words">
                    {oficial.nombre}
                  </span>
                </th>
                {EVALUADOR_KEYS.map((key) => (
                  <td key={key} className={tdData}>
                    {formatScore(oficial.evaluadores[key])}
                  </td>
                ))}
                <td className={tdData}>{formatScore(oficial.ts)}</td>
                <td
                  className={cn(
                    'eval-matrix-pct border px-2 py-1.5 text-center text-sm font-bold tabular-nums sm:py-2',
                    border,
                  )}
                  style={
                    tieneDesempeno
                      ? {
                          backgroundColor: colorPorScore(oficial.desempeno),
                          color: COLORS.white,
                        }
                      : { backgroundColor: '#e8ecf4', color: '#000b29' }
                  }
                  title={nivel?.label}
                >
                  {formatDesempeno(oficial)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {oficiales.length === 0 && (
        <p
          className={cn(
            'eval-matrix-empty px-4 py-10 text-center text-sm',
            dark ? 'text-white/60' : 'text-black/55',
          )}
        >
          No hay oficiales en el Excel.
        </p>
      )}
    </div>
  )
}
