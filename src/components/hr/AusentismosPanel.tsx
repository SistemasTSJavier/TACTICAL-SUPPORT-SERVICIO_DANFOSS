import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import type { AusentismoRegistro } from '@/types/rrhh'
import { MetricTile } from '@/components/hr/MetricTile'
import {
  ausentismosPorColaborador,
  ausentismosRepetidos,
  motivosAusentismosConDetalle,
  nombreCorto,
} from '@/lib/statsRrhh'
import {
  hrDetailCard,
  hrFieldLabel,
  hrFieldValue,
  hrKpiGrid,
  hrLabel,
  hrPanel,
  hrScrollArea,
  hrSelect,
  HR_PANEL_HEIGHT,
} from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type AusentismosPanelProps = {
  ausentismos: AusentismoRegistro[]
  dark?: boolean
}

const TODOS = 'todos'
const LOOP_MS = 5500

const PIE_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
  '#94a3b8',
  '#ec4899',
]

function CampoDetalle({
  label,
  value,
  dark,
}: {
  label: string
  value: string
  dark: boolean
}) {
  if (!value) return null
  return (
    <div>
      <p className={hrFieldLabel(dark)}>{label}</p>
      <p className={hrFieldValue(dark)}>{value}</p>
    </div>
  )
}

function DetalleRegistro({
  registro,
  dark,
  mostrarNombre,
  fillHeight = false,
}: {
  registro: AusentismoRegistro
  dark: boolean
  mostrarNombre: boolean
  fillHeight?: boolean
}) {
  return (
    <article className={cn(hrDetailCard(dark), 'flex flex-col', fillHeight && 'h-full')}>
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-baseline justify-between gap-2 border-b pb-3',
          dark ? 'border-white/12' : 'border-navy/10',
        )}
      >
        <p
          className={cn(
            'text-base font-bold leading-tight sm:text-lg',
            dark ? 'text-white' : 'text-black',
          )}
        >
          {mostrarNombre ? nombreCorto(registro.nombre) : registro.fecha}
        </p>
        <span
          className={cn(
            'text-xs font-semibold sm:text-sm',
            dark ? 'text-white/65' : 'text-black/55',
          )}
        >
          {mostrarNombre
            ? `${registro.fecha} · ${registro.turno} · ${registro.motivoCategoria}`
            : `${registro.turno} · ${registro.motivoCategoria}`}
        </span>
      </div>

      <div className={cn('mt-3 min-h-0 flex-1 space-y-3.5', hrScrollArea(dark))}>
        <CampoDetalle label="Descripción" value={registro.descripcion} dark={dark} />
        <CampoDetalle label="Compromiso" value={registro.compromiso} dark={dark} />
        <CampoDetalle label="Cierre" value={registro.cierre} dark={dark} />
        <CampoDetalle label="Encargado" value={registro.encargado} dark={dark} />
      </div>
    </article>
  )
}

export function AusentismosPanel({
  ausentismos,
  dark = false,
}: AusentismosPanelProps) {
  const colaboradores = useMemo(
    () =>
      [...new Set(ausentismos.map((a) => a.nombre))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [ausentismos],
  )

  const [colaboradorFiltro, setColaboradorFiltro] = useState(TODOS)
  const [loopIndex, setLoopIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const registrosLoop = useMemo(
    () =>
      [...ausentismos].sort((a, b) => {
        const byName = a.nombre.localeCompare(b.nombre)
        if (byName !== 0) return byName
        return a.fecha.localeCompare(b.fecha)
      }),
    [ausentismos],
  )

  const filtradas = useMemo(() => {
    if (colaboradorFiltro === TODOS) return ausentismos
    return ausentismos.filter((a) => a.nombre === colaboradorFiltro)
  }, [ausentismos, colaboradorFiltro])

  const repetidos = useMemo(
    () => ausentismosRepetidos(filtradas),
    [filtradas],
  )
  const motivos = useMemo(
    () => motivosAusentismosConDetalle(filtradas),
    [filtradas],
  )

  const enLoop = colaboradorFiltro === TODOS && registrosLoop.length > 0
  const registroActual = registrosLoop[loopIndex]

  useEffect(() => {
    setLoopIndex(0)
    setFadeIn(true)
  }, [colaboradorFiltro])

  useEffect(() => {
    if (!enLoop) return
    setFadeIn(false)
    const id = requestAnimationFrame(() => setFadeIn(true))
    return () => cancelAnimationFrame(id)
  }, [loopIndex, enLoop])

  useEffect(() => {
    if (!enLoop || registrosLoop.length <= 1) return

    const timer = setInterval(() => {
      setLoopIndex((i) => (i + 1) % registrosLoop.length)
    }, LOOP_MS)

    return () => clearInterval(timer)
  }, [enLoop, registrosLoop.length])

  const panelBox = (extra?: string) =>
    hrPanel(
      dark,
      cn('flex h-[380px] flex-col p-4 sm:p-5', extra),
    )

  const motivoOption = useMemo(
    () => ({
      animationDuration: 500,
      color: PIE_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: dark ? 'rgba(0,11,41,0.95)' : '#fff',
        borderColor: dark ? 'rgba(255,255,255,0.2)' : '#000b2920',
        textStyle: { color: dark ? '#fff' : '#000', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 4,
        top: 'middle',
        textStyle: { color: dark ? '#ffffffcc' : '#333', fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '78%'],
          center: ['40%', '50%'],
          padAngle: 2,
          itemStyle: { borderRadius: 4 },
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: dark ? '#fff' : '#333',
            formatter: '{d}%',
          },
          labelLine: { length: 14, length2: 8 },
          data: motivos.map((m) => ({ name: m.name, value: m.value })),
        },
      ],
    }),
    [motivos, dark],
  )

  if (!ausentismos.length) {
    return (
      <div className="grid max-w-lg grid-cols-3 gap-2">
        <MetricTile dark={dark} value="0" label="Registros" />
        <MetricTile dark={dark} value="0" label="Colaboradores" />
        <MetricTile dark={dark} value="0" label="Reincidentes" />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor="filtro-colaborador" className={hrLabel(dark)}>
          Colaborador
        </label>
        <select
          id="filtro-colaborador"
          value={colaboradorFiltro}
          onChange={(e) => setColaboradorFiltro(e.target.value)}
          className={hrSelect(dark)}
        >
          <option value={TODOS}>Todos</option>
          {colaboradores.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={hrKpiGrid()}>
        <MetricTile dark={dark} accent value={String(filtradas.length)} label="Registros" />
        <MetricTile
          dark={dark}
          value={String(ausentismosPorColaborador(filtradas).length)}
          label="Colaboradores"
        />
        <MetricTile dark={dark} value={String(repetidos.length)} label="Reincidentes" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <div className={panelBox('items-center justify-center')}>
          <ReactECharts
            option={motivoOption}
            style={{ height: HR_PANEL_HEIGHT - 56, width: '100%' }}
            notMerge
          />
        </div>

        <div className={panelBox()}>
          {enLoop && registroActual ? (
            <>
              <div
                className={cn(
                  'mb-2 flex shrink-0 justify-end',
                  dark ? 'text-white/50' : 'text-black/45',
                )}
              >
                <span className="text-sm font-bold tabular-nums sm:text-base">
                  {loopIndex + 1} / {registrosLoop.length}
                </span>
              </div>
              <div
                className={cn(
                  'min-h-0 flex-1 transition-opacity duration-300',
                  fadeIn ? 'opacity-100' : 'opacity-0',
                )}
              >
                <DetalleRegistro
                  key={registroActual.id}
                  registro={registroActual}
                  dark={dark}
                  mostrarNombre
                  fillHeight
                />
              </div>
              <div className="mt-2 flex shrink-0 justify-center gap-1">
                {registrosLoop.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Registro ${i + 1}`}
                    onClick={() => setLoopIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === loopIndex
                        ? dark
                          ? 'w-5 bg-white'
                          : 'w-5 bg-navy'
                        : dark
                          ? 'w-1.5 bg-white/30'
                          : 'w-1.5 bg-navy/25',
                    )}
                  />
                ))}
              </div>
            </>
          ) : filtradas.length === 0 ? (
            <p
              className={cn(
                'm-auto text-center text-sm',
                dark ? 'text-white/50' : 'text-black/50',
              )}
            >
              Sin registros
            </p>
          ) : (
            <div className={cn('flex min-h-0 flex-1 flex-col gap-3', hrScrollArea(dark))}>
              {filtradas.map((a) => (
                <DetalleRegistro
                  key={a.id}
                  registro={a}
                  dark={dark}
                  mostrarNombre={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {colaboradorFiltro === TODOS && repetidos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {repetidos.map((r) => (
            <button
              key={r.nombre}
              type="button"
              onClick={() => setColaboradorFiltro(r.nombre)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                dark
                  ? 'border-amber-400/30 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
                  : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100',
              )}
            >
              {nombreCorto(r.nombre)}
              <span className="opacity-80">×{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
