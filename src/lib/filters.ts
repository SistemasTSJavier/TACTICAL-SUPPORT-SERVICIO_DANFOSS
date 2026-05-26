import { rankingOficiales } from '@/lib/stats'
import type { EvaluacionOficial } from '@/types/evaluacion'
import type { FiltroMode } from '@/components/layout/FilterBar'

export function filtrarOficiales(
  oficiales: EvaluacionOficial[],
  filtro: FiltroMode,
): EvaluacionOficial[] {
  switch (filtro) {
    case 'top10':
      return rankingOficiales(oficiales).slice(0, 10)
    case 'pendientes':
      return oficiales.filter((o) => o.sinEvaluar)
    default:
      return oficiales
  }
}
