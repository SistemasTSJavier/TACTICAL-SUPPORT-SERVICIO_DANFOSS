import { useMemo, useState } from 'react'
import { useEvaluacion } from '@/context/EvaluacionProvider'
import { Header } from '@/components/layout/Header'
import { ExcelSourceBar } from '@/components/layout/ExcelSourceBar'
import { ResumenHero } from '@/components/layout/ResumenHero'
import { FilterBar, type FiltroMode } from '@/components/layout/FilterBar'
import { CompromisosPanel } from '@/components/hr/CompromisosPanel'
import { BajasPanel } from '@/components/hr/BajasPanel'
import { AusentismosPanel } from '@/components/hr/AusentismosPanel'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { TablaEvaluacion } from '@/components/table/TablaEvaluacion'
import { Evaluacion360Overview } from '@/components/evaluacion/Evaluacion360Overview'
import { filtrarOficiales } from '@/lib/filters'

export function DashboardPage() {
  const { data: evaluacionData } = useEvaluacion()
  const { meta, oficiales, evaluadoresLabels, rrhh } = evaluacionData
  const [filtro, setFiltro] = useState<FiltroMode>('todos')

  const filtrados = useMemo(
    () => filtrarOficiales(oficiales, filtro),
    [oficiales, filtro],
  )

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header meta={meta} />

      <main className="dashboard-main mx-auto w-full max-w-7xl flex-1">
        <div className="dashboard-inner">
          <ExcelSourceBar />
          <ResumenHero meta={meta} oficiales={oficiales} />

          <FilterBar filtro={filtro} onFiltroChange={setFiltro} />

          <SectionBlock step={1} title="Compromisos">
            <CompromisosPanel compromisos={rrhh.compromisos} />
          </SectionBlock>

          <SectionBlock step={2} title="Bajas">
            <BajasPanel bajas={rrhh.bajas} />
          </SectionBlock>

          <SectionBlock step={3} title="Ausentismos">
            <AusentismosPanel ausentismos={rrhh.ausentismos} />
          </SectionBlock>

          <SectionBlock
            step={4}
            title="Evaluación"
            subtitle="Oficiales a la izquierda, evaluadores arriba, calificaciones al centro y columna Desempeño (como en el Excel) con color por nivel"
          >
            <TablaEvaluacion
              oficiales={filtrados}
              evaluadoresLabels={evaluadoresLabels}
            />
          </SectionBlock>

          <SectionBlock step={5} title="Evaluación 360 — Resumen general">
            <Evaluacion360Overview oficiales={oficiales} donutHeight={400} />
          </SectionBlock>
        </div>
      </main>

      <footer className="border-t border-navy/10 bg-white px-4 py-5 text-center text-sm text-black/55">
        Tactical Support · {meta.servicio} · {meta.periodo}
      </footer>
    </div>
  )
}
