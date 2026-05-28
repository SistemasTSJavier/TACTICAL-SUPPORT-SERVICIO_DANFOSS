import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import { getNivelDesempeno, NOMENCLATURA } from '@/lib/nomenclatura'

export function getEvaluados(oficiales: EvaluacionOficial[]) {
  return oficiales.filter((o) => !o.sinEvaluar)
}

export function getSinEvaluar(oficiales: EvaluacionOficial[]) {
  return oficiales.filter((o) => o.sinEvaluar)
}

export function promedioDesempeno(oficiales: EvaluacionOficial[]) {
  const evaluados = getEvaluados(oficiales)
  if (evaluados.length === 0) return 0
  const sum = evaluados.reduce((acc, o) => acc + o.desempeno, 0)
  return sum / evaluados.length
}

export function distribucionPorNivel(oficiales: EvaluacionOficial[]) {
  const evaluados = getEvaluados(oficiales)
  const counts = new Map<string, number>()
  for (const nivel of NOMENCLATURA) {
    counts.set(nivel.label, 0)
  }
  for (const o of evaluados) {
    const nivel = getNivelDesempeno(o.desempeno)
    counts.set(nivel.label, (counts.get(nivel.label) ?? 0) + 1)
  }
  return NOMENCLATURA.map((n) => ({
    label: n.label,
    color: n.color,
    count: counts.get(n.label) ?? 0,
    percent:
      evaluados.length === 0
        ? 0
        : ((counts.get(n.label) ?? 0) / evaluados.length) * 100,
  })).filter((d) => d.count > 0 || evaluados.length === 0)
}

export function porcentajeMedioAlto(oficiales: EvaluacionOficial[]) {
  const evaluados = getEvaluados(oficiales)
  if (evaluados.length === 0) return 0
  const altoOMejor = evaluados.filter((o) => o.desempeno > 2.5).length
  return (altoOMejor / evaluados.length) * 100
}

export function promedioPorEvaluador(oficiales: EvaluacionOficial[]) {
  const evaluados = getEvaluados(oficiales)
  const result: Record<EvaluadorKey, number> = {
    shriner: 0,
    davila: 0,
    rodriguez: 0,
    cardenas: 0,
    armendariz: 0,
  }

  for (const key of EVALUADOR_KEYS) {
    const scores = evaluados
      .map((o) => o.evaluadores[key])
      .filter((s): s is number => s !== null && s > 0)
    result[key] =
      scores.length === 0
        ? 0
        : scores.reduce((a, b) => a + b, 0) / scores.length
  }

  return result
}

export function evaluadorExtremos(promedios: Record<EvaluadorKey, number>) {
  const entries = EVALUADOR_KEYS.map((k) => ({ key: k, avg: promedios[k] }))
  const sorted = [...entries].sort((a, b) => b.avg - a.avg)
  return {
    masAlto: sorted[0],
    masBajo: sorted[sorted.length - 1],
  }
}

export function rankingOficiales(oficiales: EvaluacionOficial[]) {
  return [...getEvaluados(oficiales)].sort((a, b) => b.desempeno - a.desempeno)
}

export type Filtro360 = 'todos' | 'favorable' | 'pendientes' | string

/** Promedio recibido por cada una de las 6 personas evaluadas (columnas del Excel). */
export function promediosSeisPersonasEvaluadas(
  oficiales: EvaluacionOficial[],
  labels: EvaluadoresLabels,
) {
  const filas = oficiales.filter((o) => !o.sinEvaluar)
  const items: { id: string; nombre: string; promedio: number }[] = []

  for (const key of EVALUADOR_KEYS) {
    const scores = filas
      .map((o) => o.evaluadores[key])
      .filter((s): s is number => s !== null && s > 0)
    if (scores.length === 0) continue
    items.push({
      id: key,
      nombre: labels[key],
      promedio:
        Math.round(
          (scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
        ) / 100,
    })
  }

  const tsScores = filas
    .map((o) => o.ts)
    .filter((s): s is number => s !== null && s > 0)
  if (tsScores.length > 0) {
    items.push({
      id: 'ts',
      nombre: 'TS',
      promedio:
        Math.round(
          (tsScores.reduce((a, b) => a + b, 0) / tsScores.length) * 100,
        ) / 100,
    })
  }

  return items
}

export function filtrarOficiales360(
  oficiales: EvaluacionOficial[],
  filtro: Filtro360,
) {
  if (filtro === 'pendientes') {
    return [...getSinEvaluar(oficiales)]
  }
  const evaluados = rankingOficiales(oficiales)
  if (filtro === 'todos') return evaluados
  if (filtro === 'favorable') {
    return evaluados.filter((o) => o.desempeno > 2.5)
  }
  return evaluados.filter(
    (o) => getNivelDesempeno(o.desempeno).label === filtro,
  )
}

export function promedioGrupoPorEvaluador(
  oficiales: EvaluacionOficial[],
): Record<EvaluadorKey, number> {
  return promedioPorEvaluador(oficiales)
}

export function scoresOficial(oficial: EvaluacionOficial) {
  return EVALUADOR_KEYS.map((k) => oficial.evaluadores[k]).filter(
    (s): s is number => s !== null,
  )
}

export function promedioEvaluadoresOficial(oficial: EvaluacionOficial) {
  const scores = scoresOficial(oficial)
  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

/** Desempeño final del Excel (columna DESEMPEÑO) como % sobre escala 5 */
export function porcentajeDesempeno(oficial: EvaluacionOficial): number | null {
  if (oficial.sinEvaluar || oficial.desempeno <= 0) return null
  return Math.round((oficial.desempeno / 5) * 1000) / 10
}

/** Promedio de calificaciones recibidas (evaluadores + TS) como % sobre escala 5 */
export function porcentajePromedioCalificaciones(
  oficial: EvaluacionOficial,
): number | null {
  const scores = [
    ...EVALUADOR_KEYS.map((k) => oficial.evaluadores[k]),
    oficial.ts,
  ].filter((s): s is number => s !== null && s > 0)

  if (oficial.sinEvaluar || scores.length === 0) return null

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round((avg / 5) * 1000) / 10
}

/** Promedio de calificaciones otorgadas por un evaluador (fila de matriz) como % */
export function porcentajePromedioEvaluador(
  oficiales: EvaluacionOficial[],
  key: EvaluadorKey,
): number | null {
  const scores = oficiales
    .filter((o) => !o.sinEvaluar)
    .map((o) => o.evaluadores[key])
    .filter((s): s is number => s !== null && s > 0)

  if (scores.length === 0) return null

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round((avg / 5) * 1000) / 10
}

export function porcentajePromedioTs(
  oficiales: EvaluacionOficial[],
): number | null {
  const scores = oficiales
    .filter((o) => !o.sinEvaluar && o.ts !== null && o.ts > 0)
    .map((o) => o.ts as number)

  if (scores.length === 0) return null

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round((avg / 5) * 1000) / 10
}
