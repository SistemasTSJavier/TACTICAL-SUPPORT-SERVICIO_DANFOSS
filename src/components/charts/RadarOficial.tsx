import ReactECharts from 'echarts-for-react'
import { Radar } from 'lucide-react'
import { useMemo } from 'react'
import { ChartPanel } from '@/components/layout/ChartPanel'
import { promedioGrupoPorEvaluador } from '@/lib/stats'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
} from '@/types/evaluacion'

type RadarOficialProps = {
  oficial: EvaluacionOficial | null
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  height?: number
  dark?: boolean
}

export function RadarOficial({
  oficial,
  oficiales,
  evaluadoresLabels,
  height = 380,
  dark = false,
}: RadarOficialProps) {
  const promedioGrupo = useMemo(
    () => promedioGrupoPorEvaluador(oficiales),
    [oficiales],
  )

  const option = useMemo(() => {
    const indicators = [
      ...EVALUADOR_KEYS.map((k) => ({
        name: evaluadoresLabels[k].split(' ').slice(0, 2).join(' '),
        max: 5,
      })),
      { name: 'TS', max: 5 },
    ]

    if (!oficial || oficial.sinEvaluar) {
      return {
        title: {
          text: 'Selecciona un oficial',
          subtext: 'Usa la lista o el ranking',
          left: 'center',
          top: 'center',
          textStyle: {
            color: dark ? '#ffffff' : '#000000',
            fontSize: 14,
            opacity: 0.7,
          },
          subtextStyle: {
            color: dark ? '#ffffff' : '#000000',
            fontSize: 12,
            opacity: 0.55,
          },
        },
      }
    }

    const oficialValues = [
      ...EVALUADOR_KEYS.map((k) => oficial.evaluadores[k] ?? 0),
      oficial.ts ?? 0,
    ]
    const evaluadosConTs = oficiales.filter((o) => !o.sinEvaluar && o.ts)
    const grupoValues = [
      ...EVALUADOR_KEYS.map((k) => promedioGrupo[k]),
      evaluadosConTs.reduce((a, o) => a + (o.ts ?? 0), 0) /
        Math.max(1, evaluadosConTs.length),
    ]

    return {
      tooltip: {},
      legend: {
        bottom: 0,
        data: ['Oficial seleccionado', 'Promedio del servicio'],
        textStyle: { color: dark ? '#ffffff' : '#000000', fontSize: 11 },
      },
      radar: {
        indicator: indicators,
        radius: '58%',
        axisName: {
          color: dark ? '#ffffff' : '#000000',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,11,41,0.15)',
          },
        },
        splitArea: { show: false },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              name: 'Oficial seleccionado',
              value: oficialValues,
              areaStyle: { color: 'rgba(56, 189, 248, 0.25)' },
              lineStyle: { color: '#38bdf8', width: 2 },
              itemStyle: { color: '#38bdf8' },
            },
            {
              name: 'Promedio del servicio',
              value: grupoValues,
              areaStyle: { color: 'rgba(148, 163, 184, 0.1)' },
              lineStyle: {
                color: dark ? '#94a3b8' : '#64748b',
                width: 2,
                type: 'dashed',
              },
              itemStyle: { color: dark ? '#94a3b8' : '#64748b' },
            },
          ],
        },
      ],
    }
  }, [oficial, oficiales, evaluadoresLabels, promedioGrupo, dark])

  return (
    <ChartPanel
      title="Vista 360 del oficial"
      hint="Compara las notas de cada evaluador contra el promedio general"
      icon={Radar}
      dark={dark}
    >
      <ReactECharts option={option} style={{ height }} />
    </ChartPanel>
  )
}
