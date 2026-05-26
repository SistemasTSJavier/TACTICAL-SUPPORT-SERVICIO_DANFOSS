import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react'
import { useEvaluacion } from '@/context/EvaluacionProvider'
import { Logo } from '@/components/brand/Logo'
import { CompromisosPanel } from '@/components/hr/CompromisosPanel'
import { BajasPanel } from '@/components/hr/BajasPanel'
import { AusentismosPanel } from '@/components/hr/AusentismosPanel'
import { KpiCards } from '@/components/kpi/KpiCards'
import { NomenclaturaChips } from '@/components/legend/NomenclaturaChips'
import { DistribucionDona } from '@/components/charts/DistribucionDona'
import { Evaluacion360Detalle } from '@/components/charts/Evaluacion360Detalle'
import { PromedioGauge } from '@/components/charts/PromedioGauge'
import { OficialChips } from '@/components/interactive/OficialChips'
import { getEvaluados, rankingOficiales } from '@/lib/stats'
import { buttonVariants } from '@/components/ui/button'
import { presentationSlideContent } from '@/lib/dashboardStyles'
import { cn } from '@/lib/utils'

/** Portada → Compromisos → Bajas → Ausentismos → 360 (4 diapositivas) */
const SLIDE_COUNT = 7

export function PresentationMode() {
  const { data: evaluacionData, sourceLabel, reloadFromFile, reloadFromServer, loading } =
    useEvaluacion()
  const { meta, oficiales, evaluadoresLabels, rrhh } = evaluacionData
  const [slide, setSlide] = useState(0)

  const evaluados = useMemo(() => getEvaluados(oficiales), [oficiales])
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => rankingOficiales(oficiales)[0]?.id,
  )

  const selectedOficial = useMemo(
    () => evaluados.find((o) => o.id === selectedId) ?? evaluados[0] ?? null,
    [evaluados, selectedId],
  )

  useEffect(() => {
    if (selectedId && !evaluados.some((o) => o.id === selectedId) && evaluados[0]) {
      setSelectedId(evaluados[0].id)
    }
  }, [evaluados, selectedId])

  const next = useCallback(() => {
    setSlide((s) => Math.min(SLIDE_COUNT - 1, s + 1))
  }, [])

  const prev = useCallback(() => {
    setSlide((s) => Math.max(0, s - 1))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape' && document.fullscreenElement) {
        void document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const navBtn = cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    'text-white hover:bg-white/15 hover:text-white',
  )

  return (
    <div className="presentation-dark min-h-screen text-white">
      <div className="fixed left-4 top-4 z-50">
        <Logo size="sm" dark showText={false} />
      </div>
      <div className="fixed right-4 top-4 z-50 flex gap-2">
        <button
          type="button"
          onClick={() => void document.documentElement.requestFullscreen()}
          className={cn(navBtn, 'border border-white/25')}
          aria-label="Pantalla completa"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <Link to="/" className={cn(navBtn, 'border border-white/25')} aria-label="Salir">
          <X className="h-4 w-4" />
        </Link>
      </div>
      <div className="fixed left-4 right-4 top-16 z-40 sm:left-auto sm:right-4 sm:top-4 sm:mr-28">
        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-navy/80 px-3 py-2 text-xs text-white/90 backdrop-blur-md sm:text-sm">
          <span className="max-w-[10rem] truncate sm:max-w-[16rem]">{sourceLabel}</span>
          <label className="cursor-pointer rounded-md border border-white/25 px-2.5 py-1 font-semibold hover:bg-white/10">
            Subir Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={loading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void reloadFromFile(f)
              }}
            />
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={() => void reloadFromServer()}
            className="rounded-md border border-white/25 px-2.5 py-1 font-semibold hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Original'}
          </button>
        </div>
      </div>

      <div className="presentation-slide flex min-h-screen flex-col px-4 pb-24 pt-24 sm:px-8 sm:pt-20 lg:px-12">
        {slide === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <Logo size="xl" dark className="flex-col sm:flex-row" />
            <span className="mt-8 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold tracking-wide text-white shadow-sm">
              {meta.servicio}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              SEGUIMIENTO DANFOSS
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/75 sm:text-xl">{meta.periodo}</p>
          </div>
        )}

        {slide === 1 && (
          <div className={presentationSlideContent('overflow-y-auto')}>
            <CompromisosPanel compromisos={rrhh.compromisos} dark />
          </div>
        )}

        {slide === 2 && (
          <div className={presentationSlideContent('overflow-y-auto')}>
            <BajasPanel bajas={rrhh.bajas} dark />
          </div>
        )}

        {slide === 3 && (
          <div className={presentationSlideContent('overflow-y-auto')}>
            <AusentismosPanel ausentismos={rrhh.ausentismos} dark />
          </div>
        )}

        {slide === 4 && (
          <div className={presentationSlideContent('gap-6')}>
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,240px)]">
              <KpiCards oficiales={oficiales} dark large />
              <PromedioGauge oficiales={oficiales} dark />
            </div>
            <NomenclaturaChips dark />
          </div>
        )}

        {slide === 5 && (
          <div className={presentationSlideContent()}>
            <DistribucionDona oficiales={oficiales} height={460} dark />
          </div>
        )}

        {slide === 6 && (
          <div className={presentationSlideContent('gap-5 overflow-y-auto')}>
            <OficialChips
              oficiales={evaluados}
              selectedId={selectedId}
              onSelect={setSelectedId}
              dark
            />
            <Evaluacion360Detalle
              oficial={selectedOficial}
              oficiales={oficiales}
              evaluadoresLabels={evaluadoresLabels}
              dark
            />
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/12 bg-navy/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={prev}
            disabled={slide === 0}
            className={navBtn}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5">
              {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Diapositiva ${i + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === slide ? 'w-7 bg-white' : 'w-2 bg-white/35',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-white/70">
              {slide + 1} / {SLIDE_COUNT}
            </span>
          </div>
          <button
            type="button"
            onClick={next}
            disabled={slide === SLIDE_COUNT - 1}
            className={navBtn}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
