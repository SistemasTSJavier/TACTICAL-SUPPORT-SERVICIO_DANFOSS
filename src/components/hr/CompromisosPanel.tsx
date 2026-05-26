import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import type { CompromisoSemana } from '@/types/rrhh'
import { MetricTile } from '@/components/hr/MetricTile'
import { fechaLabelCorta } from '@/lib/excelDate'
import { nombreCorto, tendenciaCompromisos } from '@/lib/statsRrhh'
import {
  hrFieldLabel,
  hrFieldValue,
  hrFilterPill,
  hrKpiGrid,
  hrPanel,
  hrScrollArea,
  HR_PANEL_HEIGHT,
} from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type CompromisosPanelProps = {
  compromisos: CompromisoSemana[]
  dark?: boolean
}

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

function SemanaMovimiento({
  semana,
  dark,
}: {
  semana: CompromisoSemana
  dark: boolean
}) {
  return (
    <div className={cn('flex h-full flex-col', hrScrollArea(dark))}>
      <p
        className={cn(
          'mb-3 shrink-0 text-center text-xs font-bold uppercase tracking-widest sm:text-sm',
          dark ? 'text-white/65' : 'text-black/50',
        )}
      >
        {semana.fechaLabel}
      </p>

      {semana.vacantes > 0 && (
        <div
          className={cn(
            'mb-3 shrink-0 rounded-xl border px-4 py-3',
            dark
              ? 'border-blue-400/30 bg-blue-500/10'
              : 'border-blue-200 bg-blue-50',
          )}
        >
          <p className={hrFieldLabel(dark)}>Puesto vacante</p>
          <p className={cn(hrFieldValue(dark), 'font-semibold')}>
            {semana.puesto || 'Por definir'}
          </p>
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-2">
        <ListaMovimiento
          titulo="Altas"
          nombres={semana.altasNombres}
          variant="alta"
          dark={dark}
        />
        <ListaMovimiento
          titulo="Bajas"
          nombres={semana.bajasNombres}
          variant="baja"
          dark={dark}
        />
      </div>
    </div>
  )
}

export function CompromisosPanel({ compromisos, dark = false }: CompromisosPanelProps) {
  const ordenados = useMemo(() => tendenciaCompromisos(compromisos), [compromisos])
  const [semanaId, setSemanaId] = useState<string>(
    () => ordenados[ordenados.length - 1]?.id ?? '',
  )

  const semana =
    ordenados.find((s) => s.id === semanaId) ?? ordenados[ordenados.length - 1]

  const selectedIndex = ordenados.findIndex((s) => s.id === semana?.id)

  const trendOption = useMemo(() => {
    const labels = ordenados.map((s) => fechaLabelCorta(s.fechaLabel))
    const vacantes = ordenados.map((s) => s.vacantes)
    const cumplimiento = ordenados.map((s) =>
      Math.round(s.cumplimiento * 10) / 10,
    )
    const minCumpl = Math.min(...cumplimiento, 90)
    const cumplMin = Math.max(88, Math.floor(minCumpl) - 2)
    const vacMax = Math.max(4, ...vacantes) + 1
    const manyWeeks = labels.length > 5

    const barColors = ordenados.map((_, i) =>
      i === selectedIndex
        ? dark
          ? '#38bdf8'
          : '#000b29'
        : dark
          ? 'rgba(56,189,248,0.55)'
          : 'rgba(0,11,41,0.45)',
    )

    const textMuted = dark ? '#ffffffb3' : '#555'
    const textBright = dark ? '#ffffff' : '#000b29'

    return {
      animationDuration: 600,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? 'rgba(0,11,41,0.96)' : '#fff',
        borderColor: dark ? 'rgba(255,255,255,0.25)' : '#000b2920',
        padding: [10, 14],
        textStyle: { color: dark ? '#fff' : '#000', fontSize: 14 },
        axisPointer: {
          type: 'shadow',
          shadowStyle: { color: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
        },
        formatter: (params: { seriesName: string; value: number; axisValue: string }[]) => {
          const fecha = params[0]?.axisValue ?? ''
          const vac = params.find((p) => p.seriesName === 'Vacantes')
          const cum = params.find((p) => p.seriesName === 'Cumplimiento')
          return [
            `<b style="font-size:14px">${fecha}</b>`,
            vac ? `<span style="color:#38bdf8">●</span> Vacantes: <b>${vac.value}</b>` : '',
            cum
              ? `<span style="color:#4ade80">●</span> Cumplimiento: <b>${cum.value}%</b>`
              : '',
          ]
            .filter(Boolean)
            .join('<br/>')
        },
      },
      grid: { left: 56, right: 60, top: 64, bottom: manyWeeks ? 56 : 48, containLabel: false },
      legend: {
        top: 8,
        left: 'center',
        itemGap: 28,
        itemWidth: 14,
        itemHeight: 10,
        textStyle: {
          color: dark ? '#ffffffe6' : '#333',
          fontSize: 13,
          fontWeight: 600,
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: dark ? '#ffffff30' : '#000b2925' } },
        axisTick: { show: false },
        axisLabel: {
          color: textBright,
          fontSize: manyWeeks ? 11 : 13,
          fontWeight: 600,
          margin: 14,
          interval: 0,
          rotate: manyWeeks ? 28 : 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Vacantes',
          nameGap: 12,
          nameTextStyle: {
            color: textMuted,
            fontSize: 12,
            fontWeight: 600,
          },
          min: 0,
          max: vacMax,
          minInterval: 1,
          axisLabel: {
            color: textMuted,
            fontSize: 12,
            fontWeight: 500,
          },
          splitLine: {
            lineStyle: { color: dark ? '#ffffff18' : '#000b2912', type: 'dashed' },
          },
        },
        {
          type: 'value',
          name: 'Cumplimiento',
          nameGap: 14,
          nameTextStyle: {
            color: textMuted,
            fontSize: 12,
            fontWeight: 600,
          },
          min: cumplMin,
          max: 100,
          interval: 4,
          axisLabel: {
            formatter: '{value}%',
            color: textMuted,
            fontSize: 12,
            fontWeight: 500,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Vacantes',
          type: 'bar',
          barWidth: '46%',
          z: 1,
          data: vacantes.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barColors[i],
              borderRadius: [8, 8, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'insideTop',
            distance: 8,
            fontSize: 13,
            fontWeight: 'bold',
            color: '#ffffff',
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowBlur: 4,
          },
        },
        {
          name: 'Cumplimiento',
          type: 'line',
          yAxisIndex: 1,
          z: 3,
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: (_: number, params: { dataIndex: number }) =>
            params.dataIndex === selectedIndex ? 14 : 10,
          data: cumplimiento.map((v, i) => ({
            value: v,
            label: {
              show: true,
              position: i % 2 === 0 ? 'top' : 'bottom',
              distance: i % 2 === 0 ? 12 : 10,
              formatter: `${v}%`,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#4ade80',
              backgroundColor: dark ? 'rgba(0,11,41,0.9)' : 'rgba(255,255,255,0.95)',
              borderColor: dark ? 'rgba(74,222,128,0.45)' : 'rgba(34,197,94,0.35)',
              borderWidth: 1,
              borderRadius: 6,
              padding: [3, 7],
            },
          })),
          itemStyle: {
            color: '#4ade80',
            borderColor: dark ? '#000b29' : '#fff',
            borderWidth: 3,
          },
          lineStyle: { color: '#4ade80', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(74,222,128,0.28)' },
                { offset: 1, color: 'rgba(74,222,128,0.02)' },
              ],
            },
          },
          labelLayout: {
            moveOverlap: 'shiftY',
          },
          emphasis: {
            scale: 1.15,
            label: { fontSize: 13 },
          },
        },
      ],
    }
  }, [ordenados, dark, selectedIndex])

  const onChartClick = (params: { dataIndex?: number }) => {
    if (params.dataIndex != null && ordenados[params.dataIndex]) {
      setSemanaId(ordenados[params.dataIndex].id)
    }
  }

  if (!ordenados.length) {
    return (
      <p className={cn('text-center text-sm', dark ? 'text-white/60' : 'text-black/50')}>
        Sin datos de compromisos
      </p>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {ordenados.map((s) => {
          const active = s.id === semana?.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSemanaId(s.id)}
              className={hrFilterPill(active, dark)}
            >
              {s.fechaLabel}
            </button>
          )
        })}
      </div>

      {semana && (
        <div className={cn(hrKpiGrid(), 'lg:grid-cols-6')}>
          <MetricTile dark={dark} value={String(semana.plantilla)} label="Plantilla" />
          <MetricTile dark={dark} value={String(semana.vacantes)} label="Vacantes" />
          <MetricTile
            dark={dark}
            value={String(semana.contrataciones)}
            label="Meta contratación"
          />
          <MetricTile
            dark={dark}
            accent
            value={`${Math.round(semana.cumplimiento)}%`}
            label="Cumplimiento"
          />
          <MetricTile
            dark={dark}
            value={String(semana.altasNombres.length || semana.altas)}
            label="Altas"
          />
          <MetricTile
            dark={dark}
            value={String(semana.bajasNombres.length || semana.bajas)}
            label="Bajas"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <div className={hrPanel(dark, 'overflow-visible p-4 sm:p-5')}>
          <ReactECharts
            option={trendOption}
            style={{ height: HR_PANEL_HEIGHT - 32, minHeight: 320, width: '100%' }}
            notMerge
            onEvents={{ click: onChartClick }}
          />
        </div>

        {semana && (
          <div
            className={hrPanel(
              dark,
              'flex h-[380px] flex-col p-4 sm:p-5',
            )}
          >
            <SemanaMovimiento semana={semana} dark={dark} />
          </div>
        )}
      </div>
    </div>
  )
}
