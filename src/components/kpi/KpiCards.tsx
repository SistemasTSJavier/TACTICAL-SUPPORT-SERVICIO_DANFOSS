import { Users, ThumbsUp, Clock } from 'lucide-react'
import {
  getEvaluados,
  getSinEvaluar,
  porcentajeMedioAlto,
  type Filtro360,
} from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { hrPanel } from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

type KpiCardsProps = {
  oficiales: EvaluacionOficial[]
  large?: boolean
  dark?: boolean
  filtroActivo?: Filtro360
  onFiltro?: (filtro: Filtro360) => void
}

export function KpiCards({
  oficiales,
  large = false,
  dark = false,
  filtroActivo,
  onFiltro,
}: KpiCardsProps) {
  const evaluados = getEvaluados(oficiales)
  const sinEvaluar = getSinEvaluar(oficiales)
  const pctBueno = porcentajeMedioAlto(oficiales)

  const items: {
    key: Filtro360
    label: string
    sub: string
    value: string
    icon: typeof Users
    alert?: boolean
  }[] = [
    {
      key: 'todos',
      label: 'Ya evaluados',
      sub: 'de la plantilla total',
      value: `${evaluados.length} de ${oficiales.length}`,
      icon: Users,
    },
    {
      key: 'favorable',
      label: 'Desempeño favorable',
      sub: 'puntaje MEDIO o mejor (> 2.5)',
      value: `${pctBueno.toFixed(0)}%`,
      icon: ThumbsUp,
    },
    {
      key: 'pendientes',
      label: 'Por evaluar',
      sub: sinEvaluar.length ? 'requieren calificación' : 'ninguno pendiente',
      value: String(sinEvaluar.length),
      icon: Clock,
      alert: sinEvaluar.length > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item) => {
        const active = onFiltro && filtroActivo === item.key
        const Wrapper = onFiltro ? 'button' : 'div'

        return (
        <Wrapper
          key={item.label}
          type={onFiltro ? 'button' : undefined}
          onClick={onFiltro ? () => onFiltro(item.key) : undefined}
          className={cn(
            hrPanel(dark, 'w-full px-5 py-5 text-left transition-all'),
            onFiltro && 'cursor-pointer hover:scale-[1.01]',
            active &&
              (dark
                ? 'ring-2 ring-sky-300/80'
                : 'border-navy ring-2 ring-navy/25'),
            item.alert &&
              !dark &&
              !active &&
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
        </Wrapper>
        )
      })}
    </div>
  )
}
