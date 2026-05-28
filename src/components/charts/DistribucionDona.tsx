import ReactECharts from 'echarts-for-react'
import { PieChart } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { colorPorNivelLabel } from '@/lib/colors'
import { distribucionPorNivel } from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { cn } from '@/lib/utils'

type DistribucionDonaProps = {
  oficiales: EvaluacionOficial[]
  height?: number
  dark?: boolean
  /** Sin panel exterior (dentro de Evaluacion360Overview) */
  embedded?: boolean
  nivelActivo?: string | null
  onNivelClick?: (label: string | null) => void
}

export function DistribucionDona({
  oficiales,
  height = 360,
  dark = false,
  embedded = false,
  nivelActivo = null,
  onNivelClick,
}: DistribucionDonaProps) {
  const data = useMemo(() => distribucionPorNivel(oficiales), [oficiales])

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} colaboradores ({d}%)',
      },
      legend: {
        bottom: 0,
        textStyle: {
          color: dark ? '#ffffff' : '#333333',
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '72%'],
          selectedMode: 'single',
          itemStyle: {
            borderRadius: 4,
            borderColor: dark ? '#000b29' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
            color: dark ? '#ffffff' : '#333333',
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: data.map((d) => ({
            name: d.label,
            value: d.count,
            selected: nivelActivo === d.label,
            itemStyle: {
              color: colorPorNivelLabel(d.label),
              opacity:
                nivelActivo && nivelActivo !== d.label ? 0.35 : 1,
            },
          })),
        },
      ],
    }),
    [data, dark, nivelActivo],
  )

  const chartEvents = useMemo(
    () => ({
      click: (params: { name?: string }) => {
        if (!onNivelClick || !params.name) return
        onNivelClick(nivelActivo === params.name ? null : params.name)
      },
    }),
    [onNivelClick, nivelActivo],
  )

  if (embedded) {
    return (
      <div
        className={cn(
          'rounded-xl border p-2 sm:p-4',
          dark ? 'border-white/10 bg-white/[0.04]' : 'border-navy/8 bg-surface',
        )}
      >
        {onNivelClick && (
          <p
            className={cn(
              'mb-2 text-center text-xs sm:text-sm',
              dark ? 'text-white/55' : 'text-black/50',
            )}
          >
            Toca un segmento para filtrar la lista
          </p>
        )}
        <ReactECharts
          option={option}
          style={{ height, width: '100%' }}
          notMerge
          onEvents={onNivelClick ? chartEvents : undefined}
        />
      </div>
    )
  }

  return (
    <ChartPanel
      title="Distribución del desempeño en el servicio"
      hint="Cuántos colaboradores hay en cada nivel"
      icon={PieChart}
      dark={dark}
    >
      <ReactECharts option={option} style={{ height }} />
    </ChartPanel>
  )
}
