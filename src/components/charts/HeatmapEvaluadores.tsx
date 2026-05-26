import ReactECharts from 'echarts-for-react'
import { Grid3x3 } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { getEvaluados } from '@/lib/stats'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
} from '@/types/evaluacion'

type HeatmapEvaluadoresProps = {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  height?: number
  dark?: boolean
}

export function HeatmapEvaluadores({
  oficiales,
  evaluadoresLabels,
  height = 480,
  dark = false,
}: HeatmapEvaluadoresProps) {
  const evaluados = useMemo(() => getEvaluados(oficiales), [oficiales])

  const option = useMemo(() => {
    const yLabels = evaluados.map((o) => {
      const p = o.nombre.split(' ')
      return p.length > 2 ? `${p[0]} ${p[1]}` : o.nombre
    })
    const xLabels = [
      ...EVALUADOR_KEYS.map((k) =>
        evaluadoresLabels[k].split(' ').slice(0, 2).join(' '),
      ),
      'TS',
    ]

    const data: [number, number, number | string][] = []
    evaluados.forEach((o, yi) => {
      EVALUADOR_KEYS.forEach((k, xi) => {
        const v = o.evaluadores[k]
        data.push([xi, yi, v ?? '-'])
      })
      data.push([5, yi, o.ts ?? '-'])
    })

    return {
      tooltip: {
        position: 'top',
        formatter: (p: { value: [number, number, number | string] }) => {
          const [x, y, v] = p.value
          return `<strong>${yLabels[y]}</strong><br/>${xLabels[x]}: ${v}`
        },
      },
      grid: { left: 108, right: 32, top: 24, bottom: 88 },
      xAxis: {
        type: 'category',
        data: xLabels,
        splitArea: { show: true },
        axisLabel: {
          rotate: 28,
          fontSize: 10,
          color: dark ? '#ffffff' : '#000000',
        },
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        splitArea: { show: true },
        axisLabel: {
          fontSize: 10,
          color: dark ? '#ffffff' : '#000000',
        },
      },
      visualMap: {
        min: 0,
        max: 5,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 4,
        text: ['Alto', 'Bajo'],
        textStyle: {
          color: dark ? '#ffffff' : '#000000',
          fontSize: 10,
        },
        inRange: {
          color: ['#ef4444', '#eab308', '#22c55e'],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: data.map(([x, y, v]) => [x, y, v === '-' ? 0 : (v as number)]),
          label: {
            show: true,
            formatter: (p: { data: [number, number, number] }) => {
              const v = data.find(
                (d) => d[0] === p.data[0] && d[1] === p.data[1],
              )?.[2]
              return v === '-' ? '—' : Number(v).toFixed(1)
            },
            fontSize: 9,
            color: '#fff',
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' },
          },
        },
      ],
    }
  }, [evaluados, evaluadoresLabels, dark])

  return (
    <ChartPanel
      title="Calificación por evaluador"
      hint="Filas: colaboradores · Columnas: evaluadores. Cada celda es la calificación asignada."
      icon={Grid3x3}
      dark={dark}
    >
      <ReactECharts option={option} style={{ height }} />
    </ChartPanel>
  )
}
