import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import type { AusentismoRegistro } from '@/types/rrhh'
import { MetricTile } from '@/components/hr/MetricTile'
import { weekKeyToLabel } from '@/lib/excelDate'
import {
  ausentismosHistoricos,
  ausentismosPorColaborador,
  ausentismosRepetidos,
  ausentismosSemanaActual,
  motivosAusentismosConDetalle,
  semanaActualKey,
} from '@/lib/statsRrhh'
import {
  hrDetailCard,
  hrFieldLabel,
  hrFieldValue,
  hrKpiGrid,
  hrPanel,
  hrScrollArea,
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
  return (
    <div>
      <p className={hrFieldLabel(dark)}>{label}</p>
      <p className={cn(hrFieldValue(dark), !value && 'italic opacity-60')}>
        {value || '—'}
      </p>
    </div>
  )
}

function DetalleCampos({
  registro,
  dark,
}: {
  registro: AusentismoRegistro
  dark: boolean
}) {
  return (
    <article className={cn(hrDetailCard(dark), 'flex h-full flex-col')}>
      <div
        className={cn(
          'mb-3 shrink-0 border-b pb-3',
          dark ? 'border-white/12' : 'border-navy/10',
        )}
      >
        <p
          className={cn(
            'text-base font-bold leading-snug whitespace-normal break-words sm:text-lg',
            dark ? 'text-white' : 'text-navy',
          )}
        >
          {registro.nombre}
        </p>
        <p
          className={cn(
            'mt-1 text-xs font-semibold sm:text-sm',
            dark ? 'text-white/65' : 'text-black/55',
          )}
        >
          {registro.fecha} · {registro.turno} · {registro.motivoCategoria}
        </p>
      </div>

      <div className={cn('min-h-0 flex-1 space-y-4', hrScrollArea(dark))}>
        <CampoDetalle label="Descripción" value={registro.descripcion} dark={dark} />
        <CampoDetalle label="Compromiso" value={registro.compromiso} dark={dark} />
        <CampoDetalle label="Cierre" value={registro.cierre} dark={dark} />
        <CampoDetalle label="Encargado" value={registro.encargado} dark={dark} />
        <CampoDetalle label="Asunto" value={registro.asunto} dark={dark} />
        <CampoDetalle label="Comentarios" value={registro.comentarios} dark={dark} />
      </div>
    </article>
  )
}

function useAusentismosVista(ausentismos: AusentismoRegistro[]) {
  const activos = useMemo(() => ausentismosSemanaActual(ausentismos), [ausentismos])
  const historicos = useMemo(() => ausentismosHistoricos(ausentismos), [ausentismos])
  const semanaLabel = weekKeyToLabel(semanaActualKey())
  return { activos, historicos, semanaLabel }
}

function PanelAusentismos({
  ausentismos,
  dark,
  titulo,
  soloLectura = false,
}: {
  ausentismos: AusentismoRegistro[]
  dark: boolean
  titulo: string
  soloLectura?: boolean
}) {
  const colaboradoresLista = useMemo(
    () => ausentismosPorColaborador(ausentismos),
    [ausentismos],
  )

  const repetidosSet = useMemo(
    () => new Set(ausentismosRepetidos(ausentismos).map((r) => r.nombre)),
    [ausentismos],
  )

  const [colaboradorFiltro, setColaboradorFiltro] = useState(TODOS)
  const [loopIndex, setLoopIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const registrosVista = useMemo(() => {
    const base =
      colaboradorFiltro === TODOS
        ? ausentismos
        : ausentismos.filter((a) => a.nombre === colaboradorFiltro)
    return [...base].sort((a, b) => {
      const byName = a.nombre.localeCompare(b.nombre)
      if (byName !== 0) return byName
      return a.fecha.localeCompare(b.fecha)
    })
  }, [ausentismos, colaboradorFiltro])

  const filtradas = useMemo(() => {
    if (colaboradorFiltro === TODOS) return ausentismos
    return ausentismos.filter((a) => a.nombre === colaboradorFiltro)
  }, [ausentismos, colaboradorFiltro])

  const repetidos = useMemo(() => ausentismosRepetidos(filtradas), [filtradas])
  const motivos = useMemo(() => motivosAusentismosConDetalle(filtradas), [filtradas])

  const enLoop = !soloLectura && colaboradorFiltro === TODOS && registrosVista.length > 1
  const registroMostrado =
    registrosVista[Math.min(loopIndex, Math.max(0, registrosVista.length - 1))]

  useEffect(() => {
    setLoopIndex(0)
    setFadeIn(true)
  }, [colaboradorFiltro, ausentismos])

  useEffect(() => {
    if (loopIndex >= registrosVista.length) setLoopIndex(0)
  }, [loopIndex, registrosVista.length])

  useEffect(() => {
    setFadeIn(false)
    const id = requestAnimationFrame(() => setFadeIn(true))
    return () => cancelAnimationFrame(id)
  }, [loopIndex, colaboradorFiltro])

  useEffect(() => {
    if (!enLoop) return
    const timer = setInterval(() => {
      setLoopIndex((i) => (i + 1) % registrosVista.length)
    }, LOOP_MS)
    return () => clearInterval(timer)
  }, [enLoop, registrosVista.length])

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
        bottom: 0,
        left: 'center',
        textStyle: { color: dark ? '#ffffffcc' : '#333', fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '82%'],
          center: ['50%', '43%'],
          padAngle: 2,
          itemStyle: { borderRadius: 4 },
          label: {
            show: true,
            fontSize: 11,
            fontWeight: 'bold',
            color: dark ? '#fff' : '#333',
            formatter: '{d}%',
          },
          labelLine: { length: 10, length2: 6 },
          data: motivos.map((m) => ({ name: m.name, value: m.value })),
        },
      ],
    }),
    [motivos, dark],
  )

  const listaBtn = (active: boolean) =>
    cn(
      'flex w-full flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-3',
      active
        ? dark
          ? 'border-sky-300/70 bg-sky-300/15 text-white ring-1 ring-sky-300/40'
          : 'border-navy bg-navy/5 text-navy ring-1 ring-navy/20'
        : dark
          ? 'border-white/12 bg-white/5 text-white/85 hover:border-white/25 hover:bg-white/10'
          : 'border-navy/10 bg-white text-navy hover:border-navy/20 hover:bg-surface',
      soloLectura && 'opacity-90',
    )

  if (!ausentismos.length) {
    return (
      <p className={cn('text-center text-sm py-6', dark ? 'text-white/50' : 'text-black/50')}>
        Sin registros en este periodo
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'text-xs font-bold uppercase tracking-widest',
          dark ? 'text-white/55' : 'text-black/45',
        )}
      >
        {titulo}
        {soloLectura && (
          <span
            className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold normal-case',
              dark ? 'bg-white/10 text-white/60' : 'bg-black/8 text-black/50',
            )}
          >
            Solo consulta
          </span>
        )}
      </p>

      <div className={hrKpiGrid()}>
        <MetricTile dark={dark} accent={!soloLectura} value={String(filtradas.length)} label="Registros" />
        <MetricTile dark={dark} value={String(colaboradoresLista.length)} label="Colaboradores" />
        <MetricTile dark={dark} value={String(repetidos.length)} label="Reincidentes" />
      </div>

      <div className="grid min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,380px)_1fr] xl:grid-cols-[minmax(300px,420px)_1fr] lg:gap-5">
        <div
          className={hrPanel(
            dark,
            'flex max-h-[480px] flex-col p-3 sm:max-h-[520px] sm:p-4 lg:max-h-none lg:h-[480px]',
          )}
        >
          <p
            className={cn(
              'mb-3 shrink-0 text-xs font-bold uppercase tracking-widest',
              dark ? 'text-white/55' : 'text-black/45',
            )}
          >
            Colaboradores
          </p>
          <div className={cn('min-h-0 flex-1 space-y-1.5', hrScrollArea(dark))}>
            <button
              type="button"
              onClick={() => setColaboradorFiltro(TODOS)}
              className={listaBtn(colaboradorFiltro === TODOS)}
            >
              <span>Todos</span>
              <span
                className={cn(
                  'shrink-0 self-start rounded-full px-2 py-0.5 text-xs tabular-nums sm:self-center',
                  dark ? 'bg-white/15' : 'bg-navy/10',
                )}
              >
                {ausentismos.length}
              </span>
            </button>
            {colaboradoresLista.map((c) => (
              <button
                key={c.nombre}
                type="button"
                onClick={() => setColaboradorFiltro(c.nombre)}
                className={listaBtn(colaboradorFiltro === c.nombre)}
              >
                <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug">
                  {c.nombre}
                  {repetidosSet.has(c.nombre) && (
                    <span
                      className={cn(
                        'ml-1.5 text-[10px] font-bold uppercase',
                        dark ? 'text-amber-300' : 'text-amber-700',
                      )}
                    >
                      reinc.
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'shrink-0 self-start rounded-full px-2 py-0.5 text-xs tabular-nums sm:self-center',
                    dark ? 'bg-white/15' : 'bg-navy/10',
                  )}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-[480px] flex-col gap-4">
          <div className={hrPanel(dark, 'shrink-0 p-3 sm:p-4')}>
            <p
              className={cn(
                'mb-2 text-center text-xs font-bold uppercase tracking-widest',
                dark ? 'text-white/55' : 'text-black/45',
              )}
            >
              Motivos {colaboradorFiltro === TODOS ? '' : `· ${colaboradorFiltro}`}
            </p>
            <ReactECharts option={motivoOption} style={{ height: 220, width: '100%' }} notMerge />
          </div>

          <div
            className={hrPanel(
              dark,
              'flex min-h-[220px] flex-1 flex-col p-3 sm:min-h-[260px] sm:p-5',
            )}
          >
            {registroMostrado ? (
              <>
                {registrosVista.length > 1 && (
                  <div
                    className={cn(
                      'mb-2 flex shrink-0 items-center justify-between',
                      dark ? 'text-white/55' : 'text-black/45',
                    )}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {enLoop ? 'Recorrido automático' : 'Registros'}
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {loopIndex + 1} / {registrosVista.length}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    'min-h-0 flex-1 transition-opacity duration-300',
                    fadeIn ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <DetalleCampos key={registroMostrado.id} registro={registroMostrado} dark={dark} />
                </div>
                {registrosVista.length > 1 && !soloLectura && (
                  <div className="mt-2 flex shrink-0 justify-center gap-1">
                    {registrosVista.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        aria-label={`Registro ${i + 1}`}
                        onClick={() => setLoopIndex(i)}
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          i === loopIndex
                            ? dark
                              ? 'w-5 bg-sky-300'
                              : 'w-5 bg-navy'
                            : dark
                              ? 'w-1.5 bg-white/30'
                              : 'w-1.5 bg-navy/25',
                        )}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p
                className={cn(
                  'm-auto text-center text-sm',
                  dark ? 'text-white/50' : 'text-black/50',
                )}
              >
                Sin registros
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AusentismosPanel({
  ausentismos,
  dark = false,
}: AusentismosPanelProps) {
  const { activos, historicos, semanaLabel } = useAusentismosVista(ausentismos)
  const [verHistorico, setVerHistorico] = useState(false)

  if (!ausentismos.length) {
    return (
      <div className={hrKpiGrid()}>
        <MetricTile dark={dark} value="0" label="Registros" />
        <MetricTile dark={dark} value="0" label="Colaboradores" />
        <MetricTile dark={dark} value="0" label="Reincidentes" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PanelAusentismos
        ausentismos={activos}
        dark={dark}
        titulo={`Semana actual · ${semanaLabel}`}
      />

      {historicos.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setVerHistorico((v) => !v)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
              dark
                ? 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                : 'border-navy/15 bg-surface text-navy hover:bg-navy/5',
            )}
          >
            <span>
              Histórico ({historicos.length} registros anteriores)
            </span>
            <span className={cn('text-xs', dark ? 'text-white/55' : 'text-black/45')}>
              {verHistorico ? 'Ocultar' : 'Mostrar'}
            </span>
          </button>

          {verHistorico && (
            <PanelAusentismos
              ausentismos={historicos}
              dark={dark}
              titulo="Semanas anteriores"
              soloLectura
            />
          )}
        </div>
      )}
    </div>
  )
}
