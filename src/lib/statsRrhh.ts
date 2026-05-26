import type {
  AusentismoRegistro,
  BajaRegistro,
  CompromisoSemana,
} from '@/types/rrhh'
import { monthKeyToLabel } from '@/lib/excelDate'

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
  if (!compromisos.length) return 0
  const sum = compromisos.reduce((s, c) => s + c.cumplimiento, 0)
  return sum / compromisos.length
}

export function nombreCorto(nombre: string): string {
  const parts = nombre.trim().split(/\s+/)
  if (parts.length <= 2) return nombre
  return `${parts[0]} ${parts[parts.length - 2]} ${parts[parts.length - 1]}`
}
