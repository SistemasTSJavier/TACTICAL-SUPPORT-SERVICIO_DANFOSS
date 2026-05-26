import ReactECharts from 'echarts-for-react'
import { PieChart } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { colorPorNivelLabel } from '@/lib/colors'
import { distribucionPorNivel } from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'

type DistribucionDonaProps = {
  oficiales: EvaluacionOficial[]
  height?: number
  dark?: boolean
}

export function DistribucionDona({
  oficiales,
  height = 360,
  dark = false,
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
          data: data.map((d) => ({
            name: d.label,
            value: d.count,
            itemStyle: { color: colorPorNivelLabel(d.label) },
          })),
        },
      ],
    }),
    [data, dark],
  )

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
