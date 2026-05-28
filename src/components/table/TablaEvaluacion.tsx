import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import { colorPorScore } from '@/lib/colors'
import { getNivelDesempeno, type NivelDesempeno } from '@/lib/nomenclatura'
import { getEvaluados, promediosSeisPersonasEvaluadas } from '@/lib/stats'
import {
  hrFieldLabel,
  hrFilterScrollRow,
  hrPanel,
  hrScrollArea,
} from '@/lib/dashboardStyles'
import { NivelTag } from '@/components/ui/ScoreBadge'
import { cn } from '@/lib/utils'

type TablaEvaluacionProps = {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  dark?: boolean
}

type ColumnaEval = { id: string; label: string }

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || value <= 0) return '—'
  return value.toFixed(1)
}

function formatDesempeno(oficial: EvaluacionOficial): string {
  if (oficial.sinEvaluar || oficial.desempeno <= 0) return '—'
  return oficial.desempeno.toFixed(2)
}

function shortLabel(text: string, max = 28): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function ScorePill({
  score,
  size = 'md',
}: {
  score: number | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) {
  const empty = score === null || score === undefined || score <= 0
  const val = score ?? 0
  const sizeClass =
    size === 'lg'
      ? 'min-w-[2.75rem] px-2.5 py-1 text-base sm:text-lg'
      : size === 'xs'
        ? 'min-w-[1.65rem] px-1 py-px text-[10px] leading-none'
        : size === 'sm'
          ? 'min-w-[2rem] px-1.5 py-0.5 text-[11px]'
          : 'min-w-[2.5rem] px-2 py-0.5 text-sm'

  if (empty) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md font-bold tabular-nums',
          sizeClass,
          'bg-black/8 text-black/40',
        )}
      >
        —
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-bold tabular-nums text-white',
        sizeClass,
      )}
      style={{ backgroundColor: colorPorScore(val) }}
    >
      {formatScore(score)}
    </span>
  )
}

function ScoreRow({
  label,
  score,
  dark,
  compact,
}: {
  label: string
  score: number | null | undefined
  dark: boolean
  compact?: boolean
}) {
  const has =
    score !== null && score !== undefined && score > 0

  return (
    <div
      className={cn(
        'flex min-h-[2.125rem] items-center justify-between gap-3 rounded-lg border',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
        dark ? 'border-white/10 bg-white/[0.04]' : 'border-navy/8 bg-surface/80',
      )}
    >
      <span
        className={cn(
          'min-w-0 flex-1 text-[11px] font-medium leading-snug break-words sm:text-xs',
          dark ? 'text-white/90' : 'text-navy',
        )}
      >
        {label}
      </span>
      <ScorePill score={has ? score : null} size="sm" />
    </div>
  )
}

function EvalSubCard({
  title,
  subtitle,
  dark,
  compact,
  children,
  className,
}: {
  title: string
  subtitle?: string
  dark: boolean
  compact?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        hrPanel(dark, 'eval-sub-card flex h-fit w-full flex-col overflow-hidden'),
        className,
      )}
    >
      <div
        className={cn(
          'shrink-0 border-b px-2.5 py-1.5',
          dark ? 'border-white/10' : 'border-navy/8',
        )}
      >
        <p className={cn(hrFieldLabel(dark), compact && 'text-[10px]')}>{title}</p>
        {subtitle && (
          <p
            className={cn(
              'mt-0.5 text-[10px] leading-tight',
              dark ? 'text-white/45' : 'text-black/40',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className={cn('p-2', compact ? 'p-2' : 'sm:p-2.5')}>{children}</div>
    </div>
  )
}

function tooltipPromedio(
  nombre: string,
  valor: number,
  nivel: NivelDesempeno,
): string {
  return [
    `<b>${nombre}</b>`,
    `Promedio: <b>${valor.toFixed(2)}</b> / 5`,
    `Nivel: <b>${nivel.label}</b>`,
  ].join('<br/>')
}

/** Etiqueta en 2 líneas para el eje X (sin inclinar texto). */
function nombreEjeGrafica(nombre: string, maxChars = 16): string {
  const t = nombre.trim()
  if (t.length <= maxChars) return t
  const palabras = t.split(/\s+/)
  if (palabras.length >= 2) {
    const mitad = Math.ceil(palabras.length / 2)
    return `${palabras.slice(0, mitad).join(' ')}\n${palabras.slice(mitad).join(' ')}`
  }
  const corte = Math.min(maxChars, Math.ceil(t.length / 2))
  return `${t.slice(0, corte)}\n${t.slice(corte)}`
}

function barGradient(base: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: base },
      { offset: 1, color: `${base}55` },
    ],
  }
}

function PromedioSeisChart({
  items,
  dark,
  compact,
  inPanel = false,
}: {
  items: { nombre: string; promedio: number }[]
  dark: boolean
  compact?: boolean
  inPanel?: boolean
}) {
  const chartHeight = compact ? 248 : 272

  const option = useMemo(() => {
    const names = items.map((r) => r.nombre)
    const values = items.map((r) => r.promedio)

    const textMuted = dark ? '#ffffff99' : '#64748b'
    const textAxis = dark ? '#ffffffde' : '#1e293b'

    return {
      animationDuration: 720,
      animationEasing: 'cubicOut',
      grid: {
        left: 8,
        right: 8,
        top: 28,
        bottom: compact ? 68 : 76,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: dark ? '#ffffff40' : '#000b2930', width: 1 },
        },
        backgroundColor: dark ? 'rgba(0,11,41,0.96)' : '#fff',
        borderColor: dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        padding: [10, 12],
        textStyle: { color: dark ? '#fff' : '#0f172a', fontSize: 12 },
        formatter: (raw: { name: string; value: number }[]) => {
          const p = raw[0]
          if (!p) return ''
          const val = Number(p.value)
          return tooltipPromedio(p.name, val, getNivelDesempeno(val))
        },
      },
      xAxis: {
        type: 'category',
        data: names,
        boundaryGap: true,
        axisLine: { lineStyle: { color: dark ? '#ffffff18' : '#000b2915' } },
        axisTick: {
          show: false,
          alignWithLabel: true,
        },
        axisLabel: {
          color: textAxis,
          fontSize: compact ? 9 : 10,
          fontWeight: 500,
          interval: 0,
          rotate: 0,
          align: 'center',
          margin: 10,
          lineHeight: compact ? 13 : 14,
          width: compact ? 76 : 88,
          overflow: 'break',
          formatter: (v: string) => nombreEjeGrafica(v, compact ? 14 : 16),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5,
        interval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textMuted, fontSize: 10 },
        splitLine: {
          lineStyle: { color: dark ? '#ffffff10' : '#000b290d', type: 'dashed' },
        },
      },
      series: [
        {
          name: 'Promedio',
          type: 'bar',
          barMaxWidth: compact ? 44 : 52,
          barCategoryGap: '32%',
          barGap: '20%',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barGradient(colorPorScore(v)),
              borderRadius: [10, 10, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: colorPorScore(v),
                shadowBlur: 14,
                shadowColor: `${colorPorScore(v)}66`,
              },
            },
            animationDelay: i * 80,
          })),
          label: {
            show: true,
            position: 'top',
            distance: 6,
            formatter: (p: { value: number }) => Number(p.value).toFixed(2),
            fontWeight: 700,
            fontSize: compact ? 10 : 11,
            color: dark ? '#ffffff' : '#000b29',
          },
        },
      ],
    }
  }, [items, dark, compact])

  const chart = (
    <ReactECharts
      option={option}
      style={{ height: chartHeight, width: '100%' }}
      className="eval-chart-box w-full"
      notMerge
    />
  )

  if (inPanel) {
    return <div className="eval-chart-fit mx-auto w-full max-w-full">{chart}</div>
  }

  return (
    <div
      className={cn(
        'eval-chart-box w-full shrink-0 rounded-lg border',
        dark ? 'border-white/12 bg-white/[0.03]' : 'border-navy/10 bg-white',
      )}
    >
      <p
        className={cn(
          hrFieldLabel(dark),
          'border-b px-2 py-1.5',
          compact ? 'text-[10px]' : 'text-xs',
          dark ? 'border-white/10' : 'border-navy/8',
        )}
      >
        Promedio · 6 evaluadas
      </p>
      <div className="px-1 pb-1 pt-0.5">{chart}</div>
    </div>
  )
}

export function TablaEvaluacion({
  oficiales,
  evaluadoresLabels,
  dark = false,
}: TablaEvaluacionProps) {
  const compact = dark

  const lista = useMemo(
    () =>
      [...oficiales].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [oficiales],
  )

  const evaluados = useMemo(() => getEvaluados(lista), [lista])
  const [busqueda, setBusqueda] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => evaluados[0]?.id ?? lista[0]?.id,
  )

  const listaFiltrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return lista
    return lista.filter((o) => o.nombre.toLowerCase().includes(q))
  }, [lista, busqueda])

  useEffect(() => {
    if (selectedId && lista.some((o) => o.id === selectedId)) return
    setSelectedId(evaluados[0]?.id ?? lista[0]?.id)
  }, [lista, evaluados, selectedId])

  const selected = useMemo(
    () => lista.find((o) => o.id === selectedId) ?? null,
    [lista, selectedId],
  )

  const promediosSeis = useMemo(
    () => promediosSeisPersonasEvaluadas(oficiales, evaluadoresLabels),
    [oficiales, evaluadoresLabels],
  )

  const columnas: ColumnaEval[] = useMemo(
    () => [
      ...EVALUADOR_KEYS.map((key: EvaluadorKey) => ({
        id: key,
        label: evaluadoresLabels[key],
      })),
      { id: 'ts', label: 'TS' },
    ],
    [evaluadoresLabels],
  )

  const listaBtn = (active: boolean, dense?: boolean) =>
    cn(
      'flex w-full min-w-0 items-center rounded-lg border text-left transition-colors',
      dense ? 'gap-2 px-2 py-1' : 'gap-2 px-2.5 py-1.5',
      active
        ? dark
          ? 'border-sky-300/70 bg-sky-300/15 text-white ring-1 ring-sky-300/35'
          : 'border-navy bg-navy/5 text-navy ring-1 ring-navy/15'
        : dark
          ? 'border-white/10 bg-white/5 text-white/88 hover:bg-white/10'
          : 'border-navy/8 bg-white text-navy hover:bg-surface',
    )

  const inputClass = cn(
    'w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none',
    'focus:ring-2 focus:ring-offset-0',
    dark
      ? 'border-white/15 bg-white/8 text-white placeholder:text-white/40 focus:ring-white/15'
      : 'border-navy/12 bg-white text-navy placeholder:text-black/40 focus:ring-navy/10',
  )

  const evaluadosCount = lista.filter((o) => !o.sinEvaluar).length

  return (
    <div
      className={cn(
        'eval-section flex min-h-0 flex-col',
        compact ? 'h-full' : 'gap-5 sm:gap-6',
      )}
    >
      <div className="eval-layout flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start">
        {/* Lista */}
        <aside
          className={cn(
            hrPanel(
              dark,
              'eval-list-panel flex h-fit w-full max-h-[min(70vh,520px)] flex-col overflow-hidden lg:max-w-[min(100%,300px)] lg:shrink-0',
            ),
          )}
        >
          <div
            className={cn(
              'w-full shrink-0 border-b',
              compact ? 'px-3 py-2' : 'px-3 py-2.5 sm:px-4',
              dark ? 'border-white/10' : 'border-navy/8',
            )}
          >
            <p className={cn(hrFieldLabel(dark), compact && 'text-[10px] leading-tight')}>
              Colaboradores
            </p>
            <p
              className={cn(
                compact ? 'text-[10px] leading-tight' : 'text-[11px] sm:text-xs',
                dark ? 'text-white/50' : 'text-black/45',
              )}
            >
              {evaluadosCount}/{lista.length}
            </p>
            {!compact && (
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar…"
                className={cn(inputClass, 'mt-2')}
                aria-label="Buscar colaborador"
              />
            )}
          </div>

          {!compact && (
            <div
              className={cn(
                'border-b px-2 py-2 lg:hidden',
                dark ? 'border-white/10' : 'border-navy/8',
              )}
            >
              <div className={hrFilterScrollRow()}>
                {listaFiltrada.slice(0, 10).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                      o.id === selectedId
                        ? dark
                          ? 'bg-sky-300 text-[#000b29]'
                          : 'bg-navy text-white'
                        : dark
                          ? 'bg-white/10 text-white/80'
                          : 'bg-slate-100 text-navy',
                    )}
                  >
                    {shortLabel(o.nombre, 16)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              'eval-list-scroll overflow-y-auto px-2.5 py-2',
              'max-h-[min(52vh,440px)] lg:max-h-[min(58vh,480px)]',
              hrScrollArea(dark),
            )}
          >
            <div className="flex w-full flex-col gap-0.5">
              {(compact ? lista : listaFiltrada).map((oficial) => (
                <button
                  key={oficial.id}
                  type="button"
                  onClick={() => setSelectedId(oficial.id)}
                  className={cn(
                    listaBtn(oficial.id === selectedId, compact),
                    'w-full',
                  )}
                  title={oficial.nombre}
                >
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-left font-medium leading-snug',
                      compact
                        ? 'text-[10px] sm:text-[11px]'
                        : 'text-xs sm:text-sm',
                    )}
                  >
                    {oficial.nombre}
                  </span>
                  {oficial.sinEvaluar ? (
                    <span className="shrink-0 text-[9px] font-bold uppercase opacity-50">
                      Pend.
                    </span>
                  ) : (
                    <ScorePill
                      score={oficial.desempeno}
                      size={compact ? 'xs' : 'sm'}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Detalle */}
        <section className="eval-detail flex min-w-0 flex-1 flex-col gap-3">
          {selected && (
            <header
              className={cn(
                hrPanel(dark, 'h-fit w-full shrink-0'),
                compact ? 'px-2.5 py-1.5' : 'px-3 py-2 sm:px-4',
              )}
            >
              <p
                className={cn(
                  'font-bold leading-snug break-words',
                  compact ? 'text-sm' : 'text-base sm:text-lg',
                  dark ? 'text-white' : 'text-navy',
                )}
              >
                {selected.nombre}
              </p>
              {!selected.sinEvaluar && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-lg px-2.5 py-0.5 font-bold tabular-nums text-white',
                      compact ? 'text-lg' : 'text-xl sm:text-2xl',
                    )}
                    style={{ backgroundColor: colorPorScore(selected.desempeno) }}
                    title={getNivelDesempeno(selected.desempeno).label}
                  >
                    {formatDesempeno(selected)}
                  </span>
                  <NivelTag score={selected.desempeno} dark={dark} />
                </div>
              )}
              {selected.sinEvaluar && (
                <p className={cn('mt-1 text-xs', dark ? 'text-white/55' : 'text-black/50')}>
                  Sin evaluación en el periodo
                </p>
              )}
            </header>
          )}

          <div className="eval-cards-grid flex flex-col gap-3 lg:flex-row lg:items-start">
            <EvalSubCard
              title="Calificaciones por evaluador"
              dark={dark}
              compact={compact}
              className="min-w-0 flex-1 lg:max-w-[50%]"
            >
              {!selected ? (
                <p
                  className={cn(
                    'py-4 text-center text-sm',
                    dark ? 'text-white/50' : 'text-black/50',
                  )}
                >
                  Selecciona un colaborador
                </p>
              ) : selected.sinEvaluar ? (
                <p
                  className={cn(
                    'py-4 text-center text-sm',
                    dark ? 'text-white/50' : 'text-black/50',
                  )}
                >
                  Sin calificaciones
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {columnas.map((col) => {
                    const score =
                      col.id === 'ts'
                        ? selected.ts
                        : selected.evaluadores[col.id as EvaluadorKey]
                    return (
                      <ScoreRow
                        key={col.id}
                        label={col.label}
                        score={score}
                        dark={dark}
                        compact={compact}
                      />
                    )
                  })}
                </div>
              )}
            </EvalSubCard>

            {promediosSeis.length > 0 && (
              <EvalSubCard
                title="Promedio · 6 evaluadas"
                subtitle={`${evaluadosCount} evaluadores`}
                dark={dark}
                compact={compact}
                className="min-w-0 flex-1 lg:max-w-[50%]"
              >
                <PromedioSeisChart
                  items={promediosSeis}
                  dark={dark}
                  compact={compact}
                  inPanel
                />
              </EvalSubCard>
            )}
          </div>
        </section>
      </div>

      {/* Dashboard: búsqueda debajo en móvil si hace falta */}
      {!compact && (
        <div className="lg:hidden">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar colaborador…"
            className={inputClass}
            aria-label="Buscar colaborador"
          />
        </div>
      )}
    </div>
  )
}
