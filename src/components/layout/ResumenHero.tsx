import { getNivelDesempeno } from '@/lib/nomenclatura'
import { getEvaluados, getSinEvaluar, promedioDesempeno } from '@/lib/stats'
import type { EvaluacionMeta, EvaluacionOficial } from '@/types/evaluacion'

type ResumenHeroProps = {
  meta: EvaluacionMeta
  oficiales: EvaluacionOficial[]
}

export function ResumenHero({ meta, oficiales }: ResumenHeroProps) {
  const evaluados = getEvaluados(oficiales)
  const sinEvaluar = getSinEvaluar(oficiales)
  const promedio = promedioDesempeno(oficiales)
  const nivel = getNivelDesempeno(promedio)

  return (
    <div className="rounded-2xl border border-navy bg-navy p-5 text-white sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
        Evaluación 360 · {meta.servicio}
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
        Diagnóstico del servicio para mejora continua
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
        <strong>{evaluados.length}</strong> colaboradores evaluados de{' '}
        {oficiales.length}.
        {sinEvaluar.length > 0 && (
          <>
            {' '}
            <strong>{sinEvaluar.length}</strong> pendiente(s) de evaluación.
          </>
        )}{' '}
        Promedio del servicio: <strong>{promedio.toFixed(2)}</strong> / 5.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5">
        <span
          className="h-3 w-3 rounded-sm bg-white"
          style={{ opacity: nivel.fillOpacity }}
        />
        <span className="text-base font-semibold sm:text-lg">
          Nivel global: {nivel.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/60 sm:text-base">
        {meta.periodo} · {meta.fechaPresentacion}
      </p>
    </div>
  )
}
