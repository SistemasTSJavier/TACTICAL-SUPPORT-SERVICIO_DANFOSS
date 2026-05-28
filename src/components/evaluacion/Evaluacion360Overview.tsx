import { BarChart3, PieChart, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DistribucionDona } from '@/components/charts/DistribucionDona'
import { PromedioGauge } from '@/components/charts/PromedioGauge'
import { KpiCards } from '@/components/kpi/KpiCards'
import { NomenclaturaChips } from '@/components/legend/NomenclaturaChips'
import { NivelTag } from '@/components/ui/ScoreBadge'
import { colorPorScore } from '@/lib/colors'
import { hrPanel } from '@/lib/dashboardStyles'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
} from '@/types/evaluacion'
import {
  filtrarOficiales360,
  type Filtro360,
} from '@/lib/stats'
import { cn } from '@/lib/utils'

type Evaluacion360OverviewProps = {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels?: EvaluadoresLabels
  dark?: boolean
  large?: boolean
  donutHeight?: number
}

function esFiltroNivel(f: Filtro360): f is string {
  return f !== 'todos' && f !== 'favorable' && f !== 'pendientes'
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

function etiquetaFiltro(filtro: Filtro360): string {
  if (filtro === 'todos') return 'Todos los evaluados'
  if (filtro === 'favorable') return 'Desempeño favorable'
  if (filtro === 'pendientes') return 'Pendientes de evaluar'
  return `Nivel ${filtro}`
}

export function Evaluacion360Overview({
  oficiales,
  evaluadoresLabels,
  dark = false,
  large = false,
  donutHeight = 380,
}: Evaluacion360OverviewProps) {
  const [filtro, setFiltro] = useState<Filtro360>('todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const nivelActivo = esFiltroNivel(filtro) ? filtro : null

  const listaFiltrada = useMemo(
    () => filtrarOficiales360(oficiales, filtro),
    [oficiales, filtro],
  )

  const selected = useMemo(
    () => oficiales.find((o) => o.id === selectedId) ?? null,
    [oficiales, selectedId],
  )

  const onFiltro = (f: Filtro360) => {
    setFiltro(f)
    setSelectedId(null)
  }

  const onNivel = (label: string | null) => {
    if (label) setFiltro(label)
    else setFiltro('todos')
    setSelectedId(null)
  }

  return (
    <div className={hrPanel(dark, 'space-y-6 p-4 sm:space-y-8 sm:p-5 lg:p-6')}>
      <section className="space-y-4">
        <SubseccionTitulo
          icon={BarChart3}
          titulo="Resumen del servicio"
          subtitulo="Toca un indicador, un nivel o un segmento de la gráfica para filtrar"
          dark={dark}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,240px)]">
          <KpiCards
            oficiales={oficiales}
            dark={dark}
            large={large}
            filtroActivo={filtro}
            onFiltro={onFiltro}
          />
          <PromedioGauge oficiales={oficiales} dark={dark} />
        </div>
        <NomenclaturaChips
          dark={dark}
          nivelActivo={nivelActivo}
          onNivelClick={onNivel}
        />
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
          titulo="Distribución e integrantes"
          subtitulo="Explora por nivel y selecciona un colaborador para ver su detalle"
          dark={dark}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm font-semibold sm:text-base',
              dark ? 'text-white/80' : 'text-navy',
            )}
          >
            {etiquetaFiltro(filtro)}{' '}
            <span className={dark ? 'text-white/50' : 'text-black/45'}>
              ({listaFiltrada.length})
            </span>
          </p>
          {filtro !== 'todos' && (
            <button
              type="button"
              onClick={() => onFiltro('todos')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm',
                dark
                  ? 'border-white/25 text-white hover:bg-white/10'
                  : 'border-navy/20 text-navy hover:bg-navy/5',
              )}
            >
              <X className="h-3.5 w-3.5" />
              Quitar filtro
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_minmax(280px,1.1fr)] lg:gap-5">
          <DistribucionDona
            oficiales={oficiales}
            height={donutHeight}
            dark={dark}
            embedded
            nivelActivo={nivelActivo}
            onNivelClick={onNivel}
          />

          <div
            className={cn(
              'flex max-h-[420px] flex-col overflow-hidden rounded-xl border',
              dark ? 'border-white/10 bg-white/[0.04]' : 'border-navy/8 bg-surface',
            )}
          >
            <div
              className={cn(
                'flex shrink-0 items-center gap-2 border-b px-3 py-2.5 sm:px-4',
                dark ? 'border-white/10' : 'border-navy/10',
              )}
            >
              <Users
                className={cn('h-4 w-4', dark ? 'text-white/70' : 'text-navy')}
              />
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wide sm:text-sm',
                  dark ? 'text-white' : 'text-navy',
                )}
              >
                Colaboradores
              </span>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 sm:p-3">
              {listaFiltrada.length === 0 ? (
                <p
                  className={cn(
                    'px-2 py-8 text-center text-sm',
                    dark ? 'text-white/50' : 'text-black/50',
                  )}
                >
                  No hay colaboradores con este filtro.
                </p>
              ) : (
                listaFiltrada.map((oficial, index) => {
                  const active = oficial.id === selectedId
                  const barColor = colorPorScore(oficial.desempeno)
                  const pct = (oficial.desempeno / 5) * 100
                  const pendiente = oficial.sinEvaluar

                  return (
                    <button
                      key={oficial.id}
                      type="button"
                      onClick={() =>
                        setSelectedId(active ? null : oficial.id)
                      }
                      className={cn(
                        'grid w-full grid-cols-1 gap-2 rounded-xl border p-3 text-left transition-all sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3',
                        active
                          ? 'border-navy bg-navy text-white ring-2 ring-navy/30'
                          : dark
                            ? 'border-white/15 bg-white/5 hover:bg-white/10'
                            : 'border-navy/12 bg-white hover:border-navy/25',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold tabular-nums',
                          active
                            ? 'bg-white text-navy'
                            : dark
                              ? 'border border-white/20 text-white/80'
                              : 'border border-navy/15 text-black/50',
                        )}
                      >
                        {pendiente ? '—' : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-xs font-bold uppercase leading-snug whitespace-normal break-words sm:text-sm',
                            active ? 'text-white' : dark ? 'text-white' : 'text-black',
                          )}
                        >
                          {oficial.nombre}
                        </p>
                        {!pendiente && (
                          <div
                            className={cn(
                              'mt-1.5 h-2 overflow-hidden rounded-full',
                              active ? 'bg-white/20' : 'bg-black/10',
                            )}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {pendiente ? (
                        <span
                          className={cn(
                            'text-xs font-semibold uppercase',
                            dark ? 'text-white/50' : 'text-black/45',
                          )}
                        >
                          Pendiente
                        </span>
                      ) : (
                        <span
                          className="rounded-md px-2 py-1 text-sm font-bold tabular-nums text-white"
                          style={{ backgroundColor: barColor }}
                        >
                          {oficial.desempeno.toFixed(2)}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {selected && !selected.sinEvaluar && (
          <div
            className={cn(
              'rounded-xl border p-4 sm:p-5',
              dark
                ? 'border-white/15 bg-white/10'
                : 'border-navy/15 bg-navy/[0.03]',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-bold uppercase leading-snug whitespace-normal break-words',
                    dark ? 'text-white' : 'text-navy',
                  )}
                >
                  {selected.nombre}
                </p>
                <p
                  className={cn(
                    'mt-1 text-xs sm:text-sm',
                    dark ? 'text-white/65' : 'text-black/55',
                  )}
                >
                  Desglose de calificaciones recibidas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="rounded-lg px-3 py-1.5 text-lg font-bold tabular-nums text-white"
                  style={{
                    backgroundColor: colorPorScore(selected.desempeno),
                  }}
                >
                  {selected.desempeno.toFixed(2)}
                </span>
                <NivelTag score={selected.desempeno} dark={dark} />
              </div>
            </div>
            {evaluadoresLabels && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {EVALUADOR_KEYS.map((key) => {
                  const v = selected.evaluadores[key]
                  if (v === null || v <= 0) return null
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg border px-3 py-2',
                        dark ? 'border-white/15 bg-white/5' : 'border-navy/10 bg-white',
                      )}
                    >
                      <span
                        className={cn(
                          'min-w-0 text-[10px] font-semibold uppercase leading-snug sm:text-xs',
                          dark ? 'text-white/80' : 'text-black/70',
                        )}
                      >
                        <span className="block whitespace-normal break-words">
                          {evaluadoresLabels[key]}
                        </span>
                      </span>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 text-sm font-bold tabular-nums text-white"
                        style={{ backgroundColor: colorPorScore(v) }}
                      >
                        {v.toFixed(1)}
                      </span>
                    </div>
                  )
                })}
                {selected.ts !== null && selected.ts > 0 && (
                  <div
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-lg border px-3 py-2',
                      dark ? 'border-white/15 bg-white/5' : 'border-navy/10 bg-white',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase sm:text-xs',
                        dark ? 'text-white/80' : 'text-black/70',
                      )}
                    >
                      TS
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-sm font-bold tabular-nums text-white"
                      style={{ backgroundColor: colorPorScore(selected.ts) }}
                    >
                      {selected.ts.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
