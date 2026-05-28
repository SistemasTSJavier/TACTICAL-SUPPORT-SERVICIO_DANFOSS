import type {
  AusentismoRegistro,
  BajaRegistro,
  CompromisoPeriodo,
  CompromisoSemana,
} from '@/types/rrhh'
import { monthKeyToLabel, semanaActualKey } from '@/lib/excelDate'

export { semanaActualKey }

const TODOS_MESES = 'todos'

/** Vacantes por semana = recuento (snapshot de la semana). */
export function recuentoVacantesSemanas(semanas: CompromisoSemana[]): number {
  if (semanas.length === 0) return 0
  const conVacante = semanas.filter((s) => s.vacantes > 0)
  if (conVacante.length > 0) return conVacante[conVacante.length - 1].vacantes
  return semanas[semanas.length - 1].vacantes
}

/** Vacantes del mes = suma de vacantes de todas las semanas (solo KPI agregado). */
export function sumaVacantesSemanas(semanas: CompromisoSemana[]): number {
  return semanas.reduce((sum, s) => sum + s.vacantes, 0)
}

/**
 * % cumplimiento semanal: altas ÷ (vacantes + bajas) × 100.
 * Las bajas penalizan (aumentan el denominador). No usa el dato "meta/contratación" del Excel.
 */
export function calcularCumplimientoCompromiso(
  vacantes: number,
  altas: number,
  bajas: number,
): number {
  const objetivo = vacantes + bajas
  if (objetivo > 0) {
    return Math.min(100, Math.round((altas / objetivo) * 1000) / 10)
  }
  return 100
}

function altasBajasSemana(s: CompromisoSemana) {
  return {
    altas: s.altasNombres.length || s.altas,
    bajas: s.bajasNombres.length || s.bajas,
  }
}

/** Cumplimiento de una semana (siempre por semana, nunca Excel). */
export function cumplimientoSemana(s: CompromisoSemana): number {
  const { altas, bajas } = altasBajasSemana(s)
  return calcularCumplimientoCompromiso(s.vacantes, altas, bajas)
}

/** Mes: suma de % semanales ÷ número de semanas del mes. */
export function promedioCumplimientoSemanas(semanas: CompromisoSemana[]): number {
  if (!semanas.length) return 0
  const sum = semanas.reduce((acc, s) => acc + cumplimientoSemana(s), 0)
  return Math.round((sum / semanas.length) * 10) / 10
}

function mergeNombres(listas: string[][]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const lista of listas) {
    for (const nombre of lista) {
      const key = nombre.trim().toUpperCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(nombre.trim())
    }
  }
  return out
}

function semanaToPeriodo(s: CompromisoSemana): CompromisoPeriodo {
  const { altas, bajas } = altasBajasSemana(s)
  return {
    id: s.id,
    label: s.fechaLabel,
    tipo: 'semana',
    plantilla: s.plantilla,
    vacantes: s.vacantes,
    puesto: s.puesto,
    contrataciones: s.contrataciones,
    cumplimiento: cumplimientoSemana(s),
    altas,
    bajas,
    altasNombres: s.altasNombres,
    bajasNombres: s.bajasNombres,
    semanas: [s],
  }
}

export function compromisosPorMes(
  compromisos: CompromisoSemana[],
): CompromisoPeriodo[] {
  const ordenados = tendenciaCompromisos(compromisos)
  const porMes = new Map<string, CompromisoSemana[]>()

  for (const s of ordenados) {
    const mes = s.mes || 'sin-fecha'
    const list = porMes.get(mes) ?? []
    list.push(s)
    porMes.set(mes, list)
  }

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, semanas]) => {
      const ultima = semanas[semanas.length - 1]
      const altasNombres = mergeNombres(semanas.map((x) => x.altasNombres))
      const bajasNombres = mergeNombres(semanas.map((x) => x.bajasNombres))
      const altas =
        altasNombres.length ||
        semanas.reduce((sum, x) => sum + (x.altasNombres.length || x.altas), 0)
      const bajas =
        bajasNombres.length ||
        semanas.reduce((sum, x) => sum + (x.bajasNombres.length || x.bajas), 0)
      const vacantes = sumaVacantesSemanas(semanas)
      const contrataciones = semanas.reduce((sum, x) => sum + x.contrataciones, 0)

      return {
        id: mes,
        label: monthKeyToLabel(mes),
        tipo: 'mes' as const,
        plantilla: ultima.plantilla,
        vacantes,
        puesto: semanas.find((x) => x.puesto)?.puesto ?? '',
        contrataciones,
        cumplimiento: promedioCumplimientoSemanas(semanas),
        altas,
        bajas,
        altasNombres,
        bajasNombres,
        semanas,
      }
    })
}

export function mesesCompromisos(compromisos: CompromisoSemana[]) {
  const meses = [...new Set(compromisos.map((s) => s.mes).filter(Boolean))].sort()
  return meses
}

export function filtrarCompromisosPorMes(
  compromisos: CompromisoSemana[],
  mes: string,
) {
  if (mes === TODOS_MESES) return tendenciaCompromisos(compromisos)
  return tendenciaCompromisos(compromisos).filter((s) => s.mes === mes)
}

export function periodosDesdeSemanas(
  semanas: CompromisoSemana[],
): CompromisoPeriodo[] {
  return semanas.map(semanaToPeriodo)
}

export function resumenGeneralCompromisos(
  compromisos: CompromisoSemana[],
): CompromisoPeriodo {
  const semanas = tendenciaCompromisos(compromisos)
  const ultima = semanas[semanas.length - 1]
  const altasNombres = mergeNombres(semanas.map((x) => x.altasNombres))
  const bajasNombres = mergeNombres(semanas.map((x) => x.bajasNombres))
  const altas =
    altasNombres.length ||
    semanas.reduce((sum, x) => sum + (x.altasNombres.length || x.altas), 0)
  const bajas =
    bajasNombres.length ||
    semanas.reduce((sum, x) => sum + (x.bajasNombres.length || x.bajas), 0)
  const vacantes = sumaVacantesSemanas(semanas)

  return {
    id: 'general',
    label: 'General',
    tipo: 'mes',
    plantilla: ultima?.plantilla ?? 0,
    vacantes,
    puesto: '',
    contrataciones: semanas.reduce((sum, x) => sum + x.contrataciones, 0),
    cumplimiento: promedioCumplimientoSemanas(semanas),
    altas,
    bajas,
    altasNombres,
    bajasNombres,
    semanas,
  }
}

export { TODOS_MESES }

export function bajasPorMes(bajas: BajaRegistro[]) {
  const map = new Map<string, number>()
  for (const b of bajas) {
    map.set(b.mesBaja, (map.get(b.mesBaja) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, count]) => ({ mes, label: monthKeyToLabel(mes), count }))
}

export function motivosBajas(bajas: BajaRegistro[]) {
  const map = new Map<string, number>()
  for (const b of bajas) {
    map.set(b.motivoCategoria, (map.get(b.motivoCategoria) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}

export function motivosBajasConDetalle(bajas: BajaRegistro[]) {
  const map = new Map<string, string[]>()
  for (const b of bajas) {
    const list = map.get(b.motivoCategoria) ?? []
    list.push(b.motivo)
    map.set(b.motivoCategoria, list)
  }
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, detalles]) => ({ name, value: detalles.length, detalles }))
}

export function mesesConBajas(bajas: BajaRegistro[]) {
  return bajasPorMes(bajas)
}

export function ausentismosSemanaActual(ausentismos: AusentismoRegistro[]) {
  const actual = semanaActualKey()
  return ausentismos.filter((a) => a.semana === actual)
}

export function ausentismosHistoricos(ausentismos: AusentismoRegistro[]) {
  const actual = semanaActualKey()
  return ausentismos.filter((a) => a.semana !== actual)
}

export function semanasAusentismos(ausentismos: AusentismoRegistro[]) {
  return [...new Set(ausentismos.map((a) => a.semana).filter(Boolean))].sort()
}

export function ausentismosPorColaborador(ausentismos: AusentismoRegistro[]) {
  const map = new Map<string, { nombre: string; count: number; motivos: Set<string> }>()
  for (const a of ausentismos) {
    const prev = map.get(a.nombre) ?? {
      nombre: a.nombre,
      count: 0,
      motivos: new Set<string>(),
    }
    prev.count += 1
    prev.motivos.add(a.motivoCategoria)
    map.set(a.nombre, prev)
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .map((x) => ({
      nombre: x.nombre,
      count: x.count,
      motivos: [...x.motivos],
    }))
}

export function ausentismosRepetidos(ausentismos: AusentismoRegistro[]) {
  return ausentismosPorColaborador(ausentismos).filter((x) => x.count > 1)
}

export function motivosAusentismos(ausentismos: AusentismoRegistro[]) {
  const map = new Map<string, number>()
  for (const a of ausentismos) {
    map.set(a.motivoCategoria, (map.get(a.motivoCategoria) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}

export function ausentismosPorMes(ausentismos: AusentismoRegistro[]) {
  const map = new Map<string, number>()
  for (const a of ausentismos) {
    map.set(a.mes, (map.get(a.mes) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, count]) => ({ mes, label: monthKeyToLabel(mes), count }))
}

export function turnosAusentismos(ausentismos: AusentismoRegistro[]) {
  return [...new Set(ausentismos.map((a) => a.turno).filter(Boolean))].sort()
}

export function motivosAusentismosConDetalle(ausentismos: AusentismoRegistro[]) {
  const map = new Map<string, string[]>()
  for (const a of ausentismos) {
    const list = map.get(a.motivoCategoria) ?? []
    const texto =
      a.comentarios && a.comentarios !== 'N/A'
        ? a.comentarios
        : a.descripcion || a.asunto
    list.push(texto)
    map.set(a.motivoCategoria, list)
  }
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, detalles]) => ({ name, value: detalles.length, detalles }))
}

export function tendenciaCompromisos(compromisos: CompromisoSemana[]) {
  return [...compromisos].sort((a, b) => Number(a.fecha) - Number(b.fecha))
}

export function promedioCumplimiento(compromisos: CompromisoSemana[]) {
  return promedioCumplimientoSemanas(compromisos)
}

export function nombreCorto(nombre: string): string {
  const parts = nombre.trim().split(/\s+/)
  if (parts.length <= 2) return nombre
  return `${parts[0]} ${parts[parts.length - 2]} ${parts[parts.length - 1]}`
}
