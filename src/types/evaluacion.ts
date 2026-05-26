export type EvaluadorKey =
  | 'shriner'
  | 'davila'
  | 'rodriguez'
  | 'cardenas'
  | 'armendariz'

export type EvaluadoresScores = Record<EvaluadorKey, number | null>

export type EvaluacionOficial = {
  id: string
  nombre: string
  evaluadores: EvaluadoresScores
  ts: number | null
  desempeno: number
  sinEvaluar: boolean
}

export type EvaluacionMeta = {
  titulo: string
  servicio: string
  periodo: string
  fechaPresentacion: string
  conclusiones: string
}

export type EvaluadoresLabels = Record<EvaluadorKey, string>

import type { RrhhDataset } from '@/types/rrhh'

export type EvaluacionDataset = {
  meta: EvaluacionMeta
  evaluadoresLabels: EvaluadoresLabels
  oficiales: EvaluacionOficial[]
  rrhh: RrhhDataset
}

export const EVALUADOR_KEYS: EvaluadorKey[] = [
  'shriner',
  'davila',
  'rodriguez',
  'cardenas',
  'armendariz',
]
