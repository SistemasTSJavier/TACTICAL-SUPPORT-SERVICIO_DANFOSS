import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import type { BajaRegistro } from '@/types/rrhh'
import { MetricTile } from '@/components/hr/MetricTile'
import {
  bajasPorMes,
  mesesConBajas,
  motivosBajasConDetalle,
  nombreCorto,
} from '@/lib/statsRrhh'
import {
  hrDetailCard,
  hrFieldValue,
  hrFilterPill,
  hrKpiGrid,
  hrPanel,
  HR_PANEL_HEIGHT,
} from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type BajasPanelProps = {
  bajas: BajaRegistro[]
  dark?: boolean
}

const TODOS = 'todos'

export function BajasPanel({ bajas, dark = false }: BajasPanelProps) {
  const meses = useMemo(() => mesesConBajas(bajas), [bajas])
  const [mesFiltro, setMesFiltro] = useState<string>(TODOS)

  const filtradas = useMemo(
    () =>
      mesFiltro === TODOS
        ? bajas
        : bajas.filter((b) => b.mesBaja === mesFiltro),
    [bajas, mesFiltro],
  )

  const porMes = useMemo(() => bajasPorMes(bajas), [bajas])
  const motivos = useMemo(
    () => motivosBajasConDetalle(filtradas),
    [filtradas],
  )

  const mesOption = useMemo(
    () => ({
      animationDuration: 500,
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? 'rgba(0,11,41,0.95)' : '#fff',
        borderColor: dark ? 'rgba(255,255,255,0.2)' : '#000b2920',
        textStyle: { color: dark ? '#fff' : '#000', fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0]
          if (!p) return ''
          return `<b>${p.name}</b><br/>${p.value} baja${p.value !== 1 ? 's' : ''}`
        },
      },
      grid: { left: 44, right: 20, top: 28, bottom: 44 },
      xAxis: {
        type: 'category',
        data: porMes.map((m) => m.label),
        axisLine: { lineStyle: { color: dark ? '#ffffff25' : '#000b2920' } },
        axisTick: { show: false },
        axisLabel: {
          color: dark ? '#ffffffb3' : '#444',
          fontSize: 12,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        min: 0,
        axisLabel: { color: dark ? '#ffffff99' : '#666', fontSize: 11 },
        splitLine: {
          lineStyle: { color: dark ? '#ffffff12' : '#000b290d', type: 'dashed' },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: '48%',
          data: porMes.map((m, i) => ({
            value: m.count,
            itemStyle: {
              color:
                mesFiltro === m.mes || (mesFiltro === TODOS && i === porMes.length - 1)
                  ? dark
                    ? '#f87171'
                    : '#000b29'
                  : dark
                    ? 'rgba(248,113,113,0.4)'
                    : 'rgba(0,11,41,0.3)',
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 11,
            color: dark ? '#fff' : '#000b29',
          },
          emphasis: { itemStyle: { color: dark ? '#fca5a5' : '#000b29' } },
        },
      ],
    }),
    [porMes, dark, mesFiltro],
  )

  const motivoOption = useMemo(() => {
    const names = motivos.map((m) => m.name)
    const values = motivos.map((m) => m.value)

    return {
      animationDuration: 500,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: dark ? 'rgba(0,11,41,0.95)' : '#fff',
        borderColor: dark ? 'rgba(255,255,255,0.2)' : '#000b2920',
        textStyle: { color: dark ? '#fff' : '#000', fontSize: 11 },
        confine: true,
        extraCssText: 'max-width: 420px; white-space: normal;',
        formatter: (params: { name: string; dataIndex: number }[]) => {
          const p = params[0]
          if (!p) return ''
          const det = motivos[p.dataIndex]?.detalles ?? []
          const titulo = `<b>${p.name}</b> (${det.length})`
          const lista = det
            .map((d, i) => `${i + 1}. ${d.replace(/\//g, ' · ')}`)
            .join('<br/>')
          return `${titulo}<br/><span style="opacity:0.85;font-size:10px;line-height:1.4">${lista}</span>`
        },
      },
      grid: {
        left: 8,
        right: 36,
        top: 8,
        bottom: 8,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: dark ? '#ffffff99' : '#666', fontSize: 11 },
        splitLine: {
          lineStyle: { color: dark ? '#ffffff12' : '#000b290d', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'category',
        data: [...names].reverse(),
        axisLabel: {
          color: dark ? '#fff' : '#333',
          fontSize: 12,
          fontWeight: 600,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: [...values].reverse(),
          barWidth: '60%',
          itemStyle: {
            color: dark ? '#fbbf24' : '#000b29',
            borderRadius: [0, 6, 6, 0],
          },
          label: {
            show: true,
            position: 'right',
            fontWeight: 'bold',
            fontSize: 11,
            color: dark ? '#fff' : '#000b29',
          },
          emphasis: { itemStyle: { color: dark ? '#fcd34d' : '#000b29cc' } },
        },
      ],
    }
  }, [motivos, dark])

  const mesLabel =
    mesFiltro === TODOS
      ? 'Todos'
      : meses.find((m) => m.mes === mesFiltro)?.label ?? ''

  if (!bajas.length) {
    return (
      <p className={cn('text-center text-sm', dark ? 'text-white/60' : 'text-black/50')}>
        Sin bajas registradas
      </p>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setMesFiltro(TODOS)}
          className={hrFilterPill(mesFiltro === TODOS, dark)}
        >
          Todos
        </button>
        {meses.map((m) => (
          <button
            key={m.mes}
            type="button"
            onClick={() => setMesFiltro(m.mes)}
            className={hrFilterPill(mesFiltro === m.mes, dark)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className={hrKpiGrid('max-w-2xl')}>
        <MetricTile
          dark={dark}
          accent
          value={String(filtradas.length)}
          label={mesFiltro === TODOS ? 'Total bajas' : `Bajas ${mesLabel}`}
        />
        <MetricTile dark={dark} value={String(motivos.length)} label="Motivos" />
        <MetricTile
          dark={dark}
          value={String(porMes.length)}
          label="Meses"
          className="hidden sm:block"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <div className={hrPanel(dark, 'p-4 sm:p-5')}>
          <ReactECharts
            option={mesOption}
            style={{ height: HR_PANEL_HEIGHT - 48, minHeight: 260 }}
            notMerge
            onEvents={{
              click: (params: { dataIndex?: number }) => {
                if (params.dataIndex != null && porMes[params.dataIndex]) {
                  setMesFiltro(porMes[params.dataIndex].mes)
                }
              },
            }}
          />
        </div>
        <div className={hrPanel(dark, 'p-4 sm:p-5')}>
          <ReactECharts
            option={motivoOption}
            style={{
              height: Math.max(HR_PANEL_HEIGHT - 48, motivos.length * 40),
              minHeight: 260,
            }}
            notMerge
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {filtradas.map((b) => {
          const [titulo, ...resto] = b.motivo.split('/').map((s) => s.trim())
          const detalle = resto.join(' · ')

          return (
            <div key={b.id} className={hrDetailCard(dark)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-base font-bold leading-tight sm:text-lg',
                      dark ? 'text-white' : 'text-navy',
                    )}
                  >
                    {nombreCorto(b.nombre)}
                  </p>
                  <p className={cn('mt-1 text-sm', dark ? 'text-white/60' : 'text-black/55')}>
                    {b.posicion} · {b.fechaBaja}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase',
                    dark ? 'bg-amber-500/30 text-amber-100' : 'bg-amber-100 text-amber-900',
                  )}
                >
                  {b.motivoCategoria}
                </span>
              </div>
              <p className={cn(hrFieldValue(dark), 'mt-3 font-semibold')}>{titulo}</p>
              {detalle ? (
                <p className={cn(hrFieldValue(dark), 'mt-1 opacity-90')}>{detalle}</p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
