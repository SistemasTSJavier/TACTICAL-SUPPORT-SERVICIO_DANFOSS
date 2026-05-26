import ReactECharts from 'echarts-for-react'
import { Gauge } from 'lucide-react'
import { useMemo } from 'react'
import { CHART, colorPorScore } from '@/lib/colors'
import { getNivelDesempeno } from '@/lib/nomenclatura'
import { promedioDesempeno } from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { cn } from '@/lib/utils'

type PromedioGaugeProps = {
  oficiales: EvaluacionOficial[]
  dark?: boolean
}

export function PromedioGauge({ oficiales, dark = false }: PromedioGaugeProps) {
  const promedio = promedioDesempeno(oficiales)
  const nivel = getNivelDesempeno(promedio)
  const nivelColor = colorPorScore(promedio)

  const option = useMemo(
    () => ({
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 5,
          splitNumber: 5,
          radius: '88%',
          axisLine: {
            lineStyle: {
              width: 16,
              color: CHART.gaugeStops,
            },
          },
          pointer: { itemStyle: { color: 'auto' } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            distance: -30,
            fontSize: 10,
            fontWeight: 'bold',
            color: dark ? '#ffffff' : '#333333',
          },
          detail: {
            valueAnimation: true,
            fontSize: 32,
            fontWeight: 'bold',
            color: dark ? '#ffffff' : nivelColor,
            offsetCenter: [0, '18%'],
            formatter: () => promedio.toFixed(2),
          },
          data: [{ value: promedio }],
        },
      ],
    }),
    [promedio, dark, nivelColor],
  )

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border border-navy/15 bg-white',
        dark && 'border-white/20 !bg-navy text-white',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 border-b px-4 py-3 sm:px-5',
          dark ? 'border-white/15' : 'border-navy/10',
        )}
      >
        <Gauge className={cn('h-4 w-4', dark ? 'text-white' : 'text-navy')} />
        <div>
          <p
            className={cn(
              'text-sm font-bold sm:text-base',
              dark ? 'text-white' : 'text-black',
            )}
          >
            Promedio del servicio
          </p>
          <p className={cn('text-xs', dark ? 'text-white/70' : 'text-black/55')}>
            Escala 0 – 5
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-2 pb-3">
        <ReactECharts option={option} style={{ height: 170, width: '100%' }} />
        <NivelTagPresentation
          label={nivel.label}
          color={nivelColor}
          dark={dark}
        />
      </div>
    </div>
  )
}

function NivelTagPresentation({
  label,
  color,
  dark,
}: {
  label: string
  color: string
  dark: boolean
}) {
  return (
    <span
      className={cn(
        '-mt-1 rounded-md border px-3 py-1 text-xs font-bold uppercase sm:text-sm',
        dark ? 'text-white' : '',
      )}
      style={{
        borderColor: color,
        backgroundColor: `${color}${dark ? '44' : '22'}`,
        color: dark ? '#ffffff' : color,
      }}
    >
      Nivel {label}
    </span>
  )
}
