import { Users, ThumbsUp, Clock } from 'lucide-react'
import {
  getEvaluados,
  getSinEvaluar,
  porcentajeMedioAlto,
} from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { hrPanel } from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type KpiCardsProps = {
  oficiales: EvaluacionOficial[]
  large?: boolean
  dark?: boolean
}

export function KpiCards({
  oficiales,
  large = false,
  dark = false,
}: KpiCardsProps) {
  const evaluados = getEvaluados(oficiales)
  const sinEvaluar = getSinEvaluar(oficiales)
  const pctBueno = porcentajeMedioAlto(oficiales)

  const items = [
    {
      label: 'Ya evaluados',
      sub: 'de la plantilla total',
      value: `${evaluados.length} de ${oficiales.length}`,
      icon: Users,
    },
    {
      label: 'Desempeño favorable',
      sub: 'puntaje MEDIO o mejor (> 2.5)',
      value: `${pctBueno.toFixed(0)}%`,
      icon: ThumbsUp,
    },
    {
      label: 'Por evaluar',
      sub: sinEvaluar.length ? 'requieren calificación' : 'ninguno pendiente',
      value: String(sinEvaluar.length),
      icon: Clock,
      alert: sinEvaluar.length > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            hrPanel(dark, 'px-5 py-5'),
            item.alert &&
              !dark &&
              'border-dashed border-navy/30',
          )}
        >
          <item.icon
            className={cn('h-5 w-5 sm:h-6 sm:w-6', dark ? 'text-white/80' : 'text-navy')}
          />
          <p
            className={cn(
              'mt-3 font-bold tabular-nums leading-none tracking-tight',
              large ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
              dark ? 'text-white' : 'text-navy',
            )}
          >
            {item.value}
          </p>
          <p
            className={cn(
              'mt-1.5 text-sm font-semibold sm:text-base',
              dark ? 'text-white' : 'text-navy',
            )}
          >
            {item.label}
          </p>
          <p className={cn('mt-1 text-sm', dark ? 'text-white/60' : 'text-black/55')}>
            {item.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
