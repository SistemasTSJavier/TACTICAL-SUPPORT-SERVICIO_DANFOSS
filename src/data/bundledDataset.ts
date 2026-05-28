import type { EvaluacionDataset } from '@/types/evaluacion'
import type { RrhhDataset } from '@/types/rrhh'
import raw from './evaluacion.json'

const EMPTY_RRHH: RrhhDataset = {
  compromisos: [],
  bajas: [],
  ausentismos: [],
}

/** Datos embebidos en el bundle (sin fetch ni Excel en producción). */
export function getBundledDataset(): EvaluacionDataset {
  const data = raw as EvaluacionDataset
  return {
    ...data,
    rrhh: data.rrhh ?? EMPTY_RRHH,
  }
}
