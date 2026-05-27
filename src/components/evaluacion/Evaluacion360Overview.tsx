import { BarChart3, PieChart } from 'lucide-react'
import { DistribucionDona } from '@/components/charts/DistribucionDona'
import { PromedioGauge } from '@/components/charts/PromedioGauge'
import { KpiCards } from '@/components/kpi/KpiCards'
import { NomenclaturaChips } from '@/components/legend/NomenclaturaChips'
import { hrPanel } from '@/lib/dashboardStyles'
import type { EvaluacionOficial } from '@/types/evaluacion'
import { cn } from '@/lib/utils'

type Evaluacion360OverviewProps = {
  oficiales: EvaluacionOficial[]
  dark?: boolean
  large?: boolean
  donutHeight?: number
}

function SubseccionTitulo({
  icon: Icon,
  titulo,
  subtitulo,
  dark,
}: {
  icon: typeof BarChart3
  titulo: string
  subtitulo: string
  dark: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          dark ? 'bg-white/10 text-white/80' : 'bg-navy/8 text-navy',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3
          className={cn(
            'text-sm font-bold uppercase tracking-wide sm:text-base',
            dark ? 'text-white' : 'text-navy',
          )}
        >
          {titulo}
        </h3>
        <p
          className={cn(
            'mt-0.5 text-xs sm:text-sm',
            dark ? 'text-white/60' : 'text-black/55',
          )}
        >
          {subtitulo}
        </p>
      </div>
    </div>
  )
}

export function Evaluacion360Overview({
  oficiales,
  dark = false,
  large = false,
  donutHeight = 380,
}: Evaluacion360OverviewProps) {
  return (
    <div className={hrPanel(dark, 'space-y-6 p-4 sm:space-y-8 sm:p-5 lg:p-6')}>
      <section className="space-y-4">
        <SubseccionTitulo
          icon={BarChart3}
          titulo="Resumen del servicio"
          subtitulo="Evaluados, desempeño favorable y escala de calificación"
          dark={dark}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,240px)]">
          <KpiCards oficiales={oficiales} dark={dark} large={large} />
          <PromedioGauge oficiales={oficiales} dark={dark} />
        </div>
        <NomenclaturaChips dark={dark} />
      </section>

      <div
        className={cn(
          'border-t pt-6 sm:pt-8',
          dark ? 'border-white/12' : 'border-navy/10',
        )}
        aria-hidden
      />

      <section className="space-y-4">
        <SubseccionTitulo
          icon={PieChart}
          titulo="Distribución del desempeño"
          subtitulo="Cuántos colaboradores hay en cada nivel"
          dark={dark}
        />
        <DistribucionDona
          oficiales={oficiales}
          height={donutHeight}
          dark={dark}
          embedded
        />
      </section>
    </div>
  )
}
