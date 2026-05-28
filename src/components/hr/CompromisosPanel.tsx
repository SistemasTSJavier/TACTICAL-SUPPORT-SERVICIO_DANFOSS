import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import type { CompromisoPeriodo, CompromisoSemana } from '@/types/rrhh'
import { MetricTile } from '@/components/hr/MetricTile'
import { CHART } from '@/lib/colors'
import { fechaLabelCorta, monthKeyToLabel } from '@/lib/excelDate'
import {
  compromisosPorMes,
  filtrarCompromisosPorMes,
  mesesCompromisos,
  nombreCorto,
  periodosDesdeSemanas,
  resumenGeneralCompromisos,
  TODOS_MESES,
} from '@/lib/statsRrhh'
import {
  hrFieldLabel,
  hrFieldValue,
  hrFilterPill,
  hrFilterScrollRow,
  hrFilterToggleGroup,
  hrFilterToggleOption,
  hrKpiGrid,
  hrLabel,
  hrPanel,
} from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type CompromisosPanelProps = {
  compromisos: CompromisoSemana[]
  dark?: boolean
}

type VistaPeriodo = 'semana' | 'mes'

function ListaMovimiento({
  titulo,
  nombres,
  variant,
  dark,
}: {
  titulo: string
  nombres: string[]
  variant: 'alta' | 'baja'
  dark: boolean
}) {
  const accent =
    variant === 'alta'
      ? dark
        ? 'border-emerald-500/30 bg-emerald-500/10'
        : 'border-emerald-200 bg-emerald-50'
      : dark
        ? 'border-red-500/30 bg-red-500/10'
        : 'border-red-200 bg-red-50'

  const badge =
    variant === 'alta'
      ? dark
        ? 'bg-emerald-500/25 text-emerald-100'
        : 'bg-emerald-100 text-emerald-900'
      : dark
        ? 'bg-red-500/25 text-red-100'
        : 'bg-red-100 text-red-900'

  return (
    <div className={cn('rounded-xl border p-3 sm:p-4', accent)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={hrFieldLabel(dark)}>{titulo}</p>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', badge)}>
          {nombres.length}
        </span>
      </div>
      {nombres.length === 0 ? (
        <p className={cn('text-sm', dark ? 'text-white/50' : 'text-black/45')}>
          —
        </p>
      ) : (
        <ul className="space-y-1.5">
          {nombres.map((nombre) => (
            <li
              key={nombre}
              className={cn(
                'text-sm font-semibold leading-snug sm:text-base',
                dark ? 'text-white/92' : 'text-navy',
              )}
            >
              {nombreCorto(nombre)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PeriodoMovimiento({
  periodo,
  dark,
}: {
  periodo: CompromisoPeriodo
  dark: boolean
}) {
  const esMes = periodo.tipo === 'mes'

  return (
    <div className="flex h-fit flex-col">
      <p
        className={cn(
          'mb-3 shrink-0 text-center text-xs font-bold uppercase tracking-widest sm:text-sm',
          dark ? 'text-white/65' : 'text-black/50',
        )}
      >
        {periodo.label}
      </p>

      {periodo.vacantes > 0 && periodo.puesto && (
        <div
          className={cn(
            'mb-3 shrink-0 rounded-xl border px-4 py-3',
            dark
              ? 'border-blue-400/30 bg-blue-500/10'
              : 'border-blue-200 bg-blue-50',
          )}
        >
          <p className={hrFieldLabel(dark)}>Puesto vacante</p>
          <p className={cn(hrFieldValue(dark), 'font-semibold')}>{periodo.puesto}</p>
        </div>
      )}

      <div className="mb-3 grid shrink-0 grid-cols-3 gap-2 text-center">
        <div
          className={cn(
            'rounded-lg border px-2 py-2',
            dark ? 'border-white/15 bg-white/5' : 'border-navy/10 bg-surface',
          )}
        >
          <p className={hrFieldLabel(dark)}>Vacantes</p>
          <p className={cn('text-lg font-bold tabular-nums', dark ? 'text-white' : 'text-navy')}>
            {periodo.vacantes}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border px-2 py-2',
            dark ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50',
          )}
        >
          <p className={hrFieldLabel(dark)}>Altas</p>
          <p
            className={cn(
              'text-lg font-bold tabular-nums',
              dark ? 'text-emerald-200' : 'text-emerald-800',
            )}
          >
            {periodo.altas}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border px-2 py-2',
            dark ? 'border-red-500/25 bg-red-500/10' : 'border-red-200 bg-red-50',
          )}
        >
          <p className={hrFieldLabel(dark)}>Bajas</p>
          <p
            className={cn(
              'text-lg font-bold tabular-nums',
              dark ? 'text-red-200' : 'text-red-800',
            )}
          >
            {periodo.bajas}
          </p>
        </div>
      </div>
      <p
        className={cn(
          'mb-3 shrink-0 text-center text-xs',
          dark ? 'text-white/55' : 'text-black/45',
        )}
      >
        Cumplimiento:{' '}
        <span className="font-bold text-emerald-500">
          {Math.round(periodo.cumplimiento * 10) / 10}%
        </span>
        {esMes ? (
          <span>
            {' '}
            (promedio de {periodo.semanas.length}{' '}
            {periodo.semanas.length === 1 ? 'semana' : 'semanas'})
          </span>
        ) : (
          <span> (altas ÷ vacantes + bajas)</span>
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <ListaMovimiento
          titulo="Altas"
          nombres={periodo.altasNombres}
          variant="alta"
          dark={dark}
        />
        <ListaMovimiento
          titulo="Bajas"
          nombres={periodo.bajasNombres}
          variant="baja"
          dark={dark}
        />
      </div>
    </div>
  )
}

export function CompromisosPanel({ compromisos, dark = false }: CompromisosPanelProps) {
  const [vista, setVista] = useState<VistaPeriodo>('semana')
  const [mesFiltro, setMesFiltro] = useState(TODOS_MESES)
  const [periodoId, setPeriodoId] = useState('')

  const meses = useMemo(() => mesesCompromisos(compromisos), [compromisos])
  const porMes = useMemo(() => compromisosPorMes(compromisos), [compromisos])
  const general = useMemo(() => resumenGeneralCompromisos(compromisos), [compromisos])

  const semanasFiltradas = useMemo(
    () => filtrarCompromisosPorMes(compromisos, mesFiltro),
    [compromisos, mesFiltro],
  )

  const mesSeleccionado = mesFiltro !== TODOS_MESES

  const semanasDelMes = useMemo(
    () => filtrarCompromisosPorMes(compromisos, mesFiltro),
    [compromisos, mesFiltro],
  )

  const periodoMes = useMemo(
    () => (mesSeleccionado ? porMes.find((m) => m.id === mesFiltro) : undefined),
    [mesSeleccionado, mesFiltro, porMes],
  )

  const periodosGrafica = useMemo(() => {
    if (mesSeleccionado) return periodosDesdeSemanas(semanasDelMes)
    if (vista === 'mes') return porMes
    return periodosDesdeSemanas(semanasFiltradas)
  }, [vista, mesSeleccionado, porMes, semanasDelMes, semanasFiltradas])

  const periodoDetalle =
    periodoId === 'general'
      ? general
      : periodoId === mesFiltro && periodoMes
        ? periodoMes
        : (periodosGrafica.find((p) => p.id === periodoId) ??
          (mesSeleccionado && periodoMes
            ? periodoMes
            : periodosGrafica[periodosGrafica.length - 1]) ??
          general)

  const periodoKpis =
    mesSeleccionado && periodoMes ? periodoMes : periodoDetalle

  const selectedIndex = periodosGrafica.findIndex((p) => p.id === periodoDetalle?.id)

  useEffect(() => {
    if (mesSeleccionado) {
      setPeriodoId(mesFiltro)
      return
    }
    if (vista === 'mes') {
      const ultimo = porMes[porMes.length - 1]
      setPeriodoId(ultimo?.id ?? 'general')
      return
    }
    const ultima = semanasFiltradas[semanasFiltradas.length - 1]
    setPeriodoId(ultima?.id ?? 'general')
  }, [vista, mesFiltro, mesSeleccionado, porMes, semanasFiltradas])

  const chartLabels = useMemo(() => {
    if (vista === 'mes' && !mesSeleccionado) {
      return periodosGrafica.map((p) => p.label)
    }
    return periodosGrafica.map((p) => fechaLabelCorta(p.label))
  }, [vista, mesSeleccionado, periodosGrafica])

  const trendOption = useMemo(() => {
    const vacantes = periodosGrafica.map((p) => p.vacantes)
    const altas = periodosGrafica.map((p) => p.altas)
    const bajas = periodosGrafica.map((p) => p.bajas)
    const cumplimiento = periodosGrafica.map((p) =>
      Math.round(p.cumplimiento * 10) / 10,
    )
    const minCumpl = Math.min(...cumplimiento, 100)
    const maxCumpl = Math.max(...cumplimiento, 0)
    const cumplMin = Math.max(0, Math.floor(minCumpl) - 3)
    const cumplMax = Math.min(100, Math.ceil(maxCumpl) + 3)
    const countMax = Math.max(4, ...vacantes, ...altas, ...bajas) + 1
    const manyLabels = chartLabels.length > 5

    const barColor = (i: number, active: string, idle: string) =>
      i === selectedIndex ? active : idle

    const textMuted = dark ? '#ffffffb3' : '#555'
    const textBright = dark ? '#ffffff' : '#000b29'

    return {
      animationDuration: 600,
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? 'rgba(0,11,41,0.96)' : '#fff',
        padding: [10, 14],
        textStyle: { color: dark ? '#fff' : '#000', fontSize: 13 },
        formatter: (params: { seriesName: string; value: number; axisValue: string }[]) => {
          const titulo = params[0]?.axisValue ?? ''
          const lines = [`<b>${titulo}</b>`]
          for (const p of params) {
            if (p.seriesName === 'Cumplimiento') {
              lines.push(`Cumplimiento: <b>${p.value}%</b>`)
            } else {
              lines.push(`${p.seriesName}: <b>${p.value}</b>`)
            }
          }
          return lines.join('<br/>')
        },
      },
      grid: { left: 52, right: 56, top: 72, bottom: manyLabels ? 56 : 48 },
      legend: {
        top: 8,
        left: 'center',
        itemGap: 16,
        textStyle: { color: dark ? '#ffffffe6' : '#333', fontSize: 12 },
        data: [
          {
            name: 'Vacantes',
            itemStyle: { color: CHART.vacantes },
          },
          {
            name: 'Bajas',
            itemStyle: { color: CHART.bajas },
          },
          {
            name: 'Altas',
            itemStyle: { color: CHART.altas },
          },
          {
            name: 'Cumplimiento',
            itemStyle: { color: '#4ade80' },
          },
        ],
      },
      xAxis: {
        type: 'category',
        data: chartLabels,
        axisTick: { show: false },
        axisLabel: {
          color: textBright,
          fontSize: manyLabels ? 11 : 12,
          fontWeight: 600,
          interval: 0,
          rotate: manyLabels ? 28 : 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Cantidad',
          min: 0,
          max: countMax,
          minInterval: 1,
          axisLabel: { color: textMuted, fontSize: 11 },
          splitLine: {
            lineStyle: { color: dark ? '#ffffff15' : '#000b2910', type: 'dashed' },
          },
        },
        {
          type: 'value',
          name: '%',
          min: cumplMin,
          max: cumplMax,
          axisLabel: { formatter: '{value}%', color: textMuted, fontSize: 11 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Vacantes',
          type: 'bar',
          barGap: '20%',
          itemStyle: { color: CHART.vacantes },
          data: vacantes.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barColor(i, CHART.vacantes, CHART.vacantesDim),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 'bold',
            color: CHART.vacantes,
          },
        },
        {
          name: 'Altas',
          type: 'bar',
          itemStyle: { color: CHART.altas },
          data: altas.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barColor(i, CHART.altas, CHART.altasDim),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 'bold',
            color: CHART.altas,
            formatter: (p: { value: number }) => (p.value > 0 ? String(p.value) : ''),
          },
        },
        {
          name: 'Bajas',
          type: 'bar',
          itemStyle: { color: CHART.bajas },
          data: bajas.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barColor(i, CHART.bajas, CHART.bajasDim),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 'bold',
            color: CHART.bajas,
            formatter: (p: { value: number }) => (p.value > 0 ? String(p.value) : ''),
          },
        },
        {
          name: 'Cumplimiento',
          type: 'line',
          yAxisIndex: 1,
          smooth: 0.3,
          symbolSize: (_: number, params: { dataIndex: number }) =>
            params.dataIndex === selectedIndex ? 12 : 8,
          data: cumplimiento.map((v, i) => ({
            value: v,
            label: {
              show: true,
              position: i % 2 === 0 ? 'top' : 'bottom',
              formatter: `${v}%`,
              fontSize: 11,
              fontWeight: 'bold',
              color: '#4ade80',
              backgroundColor: dark ? 'rgba(0,11,41,0.9)' : '#fff',
              padding: [2, 6],
              borderRadius: 4,
            },
          })),
          lineStyle: { color: '#4ade80', width: 3 },
          itemStyle: { color: '#4ade80' },
          labelLayout: { moveOverlap: 'shiftY' },
        },
      ],
    }
  }, [periodosGrafica, chartLabels, dark, selectedIndex])

  const onChartClick = (params: { dataIndex?: number }) => {
    if (params.dataIndex == null || !periodosGrafica[params.dataIndex]) return
    const clicked = periodosGrafica[params.dataIndex]
    if (vista === 'mes' && !mesSeleccionado && clicked.tipo === 'mes') {
      setMesFiltro(clicked.id)
      return
    }
    setPeriodoId(clicked.id)
  }

  if (!compromisos.length) {
    return (
      <p className={cn('text-center text-sm', dark ? 'text-white/60' : 'text-black/50')}>
        Sin datos de compromisos
      </p>
    )
  }

  const pill = (active: boolean) => hrFilterPill(active, dark)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3">
        <div className={hrFilterToggleGroup(dark)}>
          <button
            type="button"
            onClick={() => setVista('semana')}
            className={hrFilterToggleOption(vista === 'semana', dark)}
          >
            Por semana
          </button>
          <button
            type="button"
            onClick={() => setVista('mes')}
            className={hrFilterToggleOption(vista === 'mes', dark)}
          >
            Por mes
          </button>
        </div>

        {meses.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className={cn(hrLabel(dark), 'shrink-0')}>Mes</span>
            <div className={hrFilterScrollRow()}>
              <button
                type="button"
                onClick={() => setMesFiltro(TODOS_MESES)}
                className={pill(mesFiltro === TODOS_MESES)}
              >
                Todos
              </button>
              {meses.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMesFiltro(m)}
                  className={pill(mesFiltro === m)}
                >
                  {monthKeyToLabel(m)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={hrFilterScrollRow()}>
        <button
          type="button"
          onClick={() => setPeriodoId('general')}
          className={cn(
            pill(periodoId === 'general'),
            'border-dashed',
            periodoId === 'general' &&
              (dark ? 'border-sky-300/60' : 'border-navy/30'),
          )}
        >
          General
        </button>
        {vista === 'semana' || mesSeleccionado
          ? (
              <>
                {mesSeleccionado && periodoMes && (
                  <button
                    type="button"
                    onClick={() => setPeriodoId(mesFiltro)}
                    className={cn(
                      pill(periodoId === mesFiltro),
                      'whitespace-nowrap',
                    )}
                  >
                    Resumen {monthKeyToLabel(mesFiltro)}
                  </button>
                )}
                {(mesSeleccionado ? semanasDelMes : semanasFiltradas).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPeriodoId(s.id)}
                    className={cn(pill(s.id === periodoId), 'whitespace-nowrap')}
                  >
                    {s.fechaLabel}
                  </button>
                ))}
              </>
            )
          : porMes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMesFiltro(m.id)
                }}
                className={pill(m.id === mesFiltro)}
              >
                {m.label}
              </button>
            ))}
      </div>

      {periodoKpis && (
        <div className={cn(hrKpiGrid(), 'sm:grid-cols-3 xl:grid-cols-6')}>
          <MetricTile dark={dark} value={String(periodoKpis.plantilla)} label="Plantilla" />
          <MetricTile dark={dark} value={String(periodoKpis.vacantes)} label="Vacantes" />
          <MetricTile
            dark={dark}
            value={String(periodoKpis.contrataciones)}
            label="Meta"
            className="xl:col-span-1"
          />
          <MetricTile
            dark={dark}
            accent
            value={`${Math.round(periodoKpis.cumplimiento * 10) / 10}%`}
            label="Cumplimiento"
          />
          <MetricTile dark={dark} value={String(periodoKpis.altas)} label="Altas" />
          <MetricTile dark={dark} value={String(periodoKpis.bajas)} label="Bajas" />
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:gap-5">
        <div className={hrPanel(dark, 'overflow-visible p-3 sm:p-5')}>
          <p
            className={cn(
              'mb-2 text-center text-xs font-bold uppercase tracking-widest sm:mb-3 sm:text-sm',
              dark ? 'text-white/70' : 'text-black/50',
            )}
          >
            {mesSeleccionado
              ? `Semanas · ${monthKeyToLabel(mesFiltro)}`
              : vista === 'mes'
                ? 'Tendencia por mes (clic en barra para desglose)'
                : 'Tendencia por semana'}
            <span
              className={cn(
                'mt-1 block font-normal normal-case tracking-normal',
                dark ? 'text-white/50' : 'text-black/45',
              )}
            >
              Semana: cumplimiento por semana. Mes: promedio de las semanas. Meta Excel: solo
              referencia.
            </span>
          </p>
          <div className="min-h-[260px] w-full sm:min-h-[320px] lg:min-h-[360px]">
            <ReactECharts
              option={trendOption}
              style={{ height: '100%', minHeight: 260, width: '100%' }}
              className="!h-[260px] sm:!h-[320px] lg:!h-[360px]"
              notMerge
              onEvents={{ click: onChartClick }}
            />
          </div>
        </div>

        {periodoDetalle && (
          <div className={hrPanel(dark, 'h-fit p-3 sm:p-5')}>
            <PeriodoMovimiento periodo={periodoDetalle} dark={dark} />
          </div>
        )}
      </div>
    </div>
  )
}
