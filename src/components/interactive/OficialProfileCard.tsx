import { User } from 'lucide-react'
import { getNivelDesempeno, getRangoLabel } from '@/lib/nomenclatura'
import type { EvaluacionOficial } from '@/types/evaluacion'

type OficialProfileCardProps = {
  oficial: EvaluacionOficial | null
}

export function OficialProfileCard({ oficial }: OficialProfileCardProps) {
  if (!oficial || oficial.sinEvaluar) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-navy/20 bg-white px-4 py-4 text-sm text-black/55">
        <User className="h-8 w-8 shrink-0 opacity-40" />
        <p>
          Selecciona un colaborador en la lista para ver su perfil 360.
        </p>
      </div>
    )
  }

  const nivel = getNivelDesempeno(oficial.desempeno)

  return (
    <div className="flex items-center gap-4 rounded-xl bg-navy px-4 py-3.5 text-white shadow-md">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-navy"
        style={{ opacity: nivel.fillOpacity }}
      >
        {oficial.desempeno.toFixed(1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{oficial.nombre}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/75">
          <span className="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 font-bold uppercase">
            {nivel.label}
          </span>
          <span>Puntaje {getRangoLabel(nivel)}</span>
        </p>
      </div>
    </div>
  )
}
