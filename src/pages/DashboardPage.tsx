import { useEffect, useMemo, useState } from 'react'
import { useEvaluacion } from '@/context/EvaluacionProvider'
import { Header } from '@/components/layout/Header'
import { ExcelSourceBar } from '@/components/layout/ExcelSourceBar'
import { ResumenHero } from '@/components/layout/ResumenHero'
import {
  FilterBar,
  type FiltroMode,
  type VistaMode,
} from '@/components/layout/FilterBar'
import { CompromisosPanel } from '@/components/hr/CompromisosPanel'
import { BajasPanel } from '@/components/hr/BajasPanel'
import { AusentismosPanel } from '@/components/hr/AusentismosPanel'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { KpiCards } from '@/components/kpi/KpiCards'
import { NomenclaturaChips } from '@/components/legend/NomenclaturaChips'
import { OficialChips } from '@/components/interactive/OficialChips'
import { TablaEvaluacion } from '@/components/table/TablaEvaluacion'
import { DistribucionDona } from '@/components/charts/DistribucionDona'
import { Evaluacion360Detalle } from '@/components/charts/Evaluacion360Detalle'
import { PromedioGauge } from '@/components/charts/PromedioGauge'
import { filtrarOficiales } from '@/lib/filters'
import { getEvaluados, rankingOficiales } from '@/lib/stats'

export function DashboardPage() {
  const { data: evaluacionData } = useEvaluacion()
  const { meta, oficiales, evaluadoresLabels, rrhh } = evaluacionData
  const [vista, setVista] = useState<VistaMode>('graficos')
  const [filtro, setFiltro] = useState<FiltroMode>('todos')
  const [selectedId, setSelectedId] = useState<string | undefined>(
    rankingOficiales(oficiales)[0]?.id,
  )

  const filtrados = useMemo(
    () => filtrarOficiales(oficiales, filtro),
    [oficiales, filtro],
  )

  const evaluadosFiltrados = useMemo(
    () => getEvaluados(filtrados),
    [filtrados],
  )

  useEffect(() => {
    if (
      selectedId &&
      !evaluadosFiltrados.some((o) => o.id === selectedId) &&
      evaluadosFiltrados[0]
    ) {
      setSelectedId(evaluadosFiltrados[0].id)
    }
  }, [evaluadosFiltrados, selectedId])

  const selectedOficial = useMemo(
    () => oficiales.find((o) => o.id === selectedId) ?? null,
    [oficiales, selectedId],
  )

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header meta={meta} />

      <main className="dashboard-main mx-auto w-full max-w-7xl flex-1">
        <div className="dashboard-inner">
          <ExcelSourceBar />
          <ResumenHero meta={meta} oficiales={oficiales} />

          <FilterBar
            vista={vista}
            filtro={filtro}
            onVistaChange={setVista}
            onFiltroChange={setFiltro}
          />

          <SectionBlock step={1} title="Compromisos">
            <CompromisosPanel compromisos={rrhh.compromisos} />
          </SectionBlock>

          <SectionBlock step={2} title="Bajas">
            <BajasPanel bajas={rrhh.bajas} />
          </SectionBlock>

          <SectionBlock step={3} title="Ausentismos">
            <AusentismosPanel ausentismos={rrhh.ausentismos} />
          </SectionBlock>

          <SectionBlock step={4} title="Evaluación 360">
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,240px)]">
              <KpiCards oficiales={oficiales} />
              <PromedioGauge oficiales={oficiales} />
            </div>
            <NomenclaturaChips />
          </SectionBlock>

          {vista === 'graficos' ? (
            <>
              <SectionBlock step={5} title="Resultados">
                <DistribucionDona oficiales={oficiales} height={400} />
              </SectionBlock>

              <SectionBlock step={6} title="Detalle 360">
                <OficialChips
                  oficiales={evaluadosFiltrados}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <Evaluacion360Detalle
                  oficial={selectedOficial}
                  oficiales={oficiales}
                  evaluadoresLabels={evaluadoresLabels}
                />
              </SectionBlock>
            </>
          ) : (
            <SectionBlock step={5} title="Matriz">
              <TablaEvaluacion
                oficiales={filtrados}
                evaluadoresLabels={evaluadoresLabels}
              />
            </SectionBlock>
          )}
        </div>
      </main>

      <footer className="border-t border-navy/10 bg-white px-4 py-5 text-center text-sm text-black/55">
        Tactical Support · {meta.servicio} · {meta.periodo}
      </footer>
    </div>
  )
}
