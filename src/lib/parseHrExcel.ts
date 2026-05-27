import * as XLSX from 'xlsx'
import type {
  AusentismoRegistro,
  BajaRegistro,
  CompromisoSemana,
  RrhhDataset,
} from '@/types/rrhh'
import { excelDateToMonthKey, formatExcelDate } from '@/lib/excelDate'

function mesDesdeFechaRaw(value: unknown): string {
  return excelDateToMonthKey(value)
}
import {
  categoriaAusentismo,
  categoriaMotivo,
  parseMovimientoSemana,
  parseNombresLista,
} from '@/lib/parseMovimiento'

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function findSheet(
  workbook: XLSX.WorkBook,
  ...names: string[]
): XLSX.WorkSheet | null {
  for (const name of names) {
    const found = workbook.SheetNames.find(
      (s) => normalizeHeader(s) === normalizeHeader(name),
    )
    if (found) return workbook.Sheets[found]
  }
  return null
}

function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  }) as unknown[][]
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function parseCompromisos(rows: unknown[][]): CompromisoSemana[] {
  if (rows.length < 2) return []
  const headers = rows[0] ?? []
  const col = (...needles: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      const h = normalizeHeader(headers[i])
      if (needles.some((n) => h.includes(n))) return i
    }
    return -1
  }

  const colExact = (name: string) => {
    const target = normalizeHeader(name)
    for (let i = 0; i < headers.length; i++) {
      if (normalizeHeader(headers[i]) === target) return i
    }
    return -1
  }

  const cServicio = col('SERVICIO') >= 0 ? col('SERVICIO') : 0
  const cPlantilla = col('PLANTILLA')
  const cVacantes = col('VACANTE')
  const cPuesto = colExact('PUESTO')
  const cFecha = col('FECHA', 'COMPROMISO')
  const cContrat = col('CONTRATACION')
  const cCumpl = col('CUMPLIMIENTO')
  const cAlta = colExact('ALTA')
  const cBaja = colExact('BAJA')
  const cComent = col('COMENTARIO')

  return rows
    .slice(1)
    .filter((row) => row?.[cFecha >= 0 ? cFecha : 4] != null)
    .map((row, index) => {
      const fechaRaw = row[cFecha >= 0 ? cFecha : 4]
      const fechaLabel = formatExcelDate(fechaRaw)
      const comentarios = String(row[cComent >= 0 ? cComent : 9] ?? '').trim()
      const altasNombres =
        cAlta >= 0 ? parseNombresLista(row[cAlta]) : []
      const bajasNombres =
        cBaja >= 0 ? parseNombresLista(row[cBaja]) : []
      const parsed = parseMovimientoSemana(comentarios)
      const altas = altasNombres.length || parsed.altas
      const bajas = bajasNombres.length || parsed.bajas
      let cumplimiento = toNumber(row[cCumpl >= 0 ? cCumpl : 6])
      if (cumplimiento > 0 && cumplimiento <= 1) cumplimiento *= 100

      const puestoRaw =
        cPuesto >= 0 ? String(row[cPuesto] ?? '').trim() : ''

      return {
        id: `sem-${index + 1}`,
        servicio: String(row[cServicio] ?? 'DANFOSS'),
        plantilla: toNumber(row[cPlantilla >= 0 ? cPlantilla : 1]),
        vacantes: toNumber(row[cVacantes >= 0 ? cVacantes : 2]),
        puesto: puestoRaw && puestoRaw.toUpperCase() !== 'N/A' ? puestoRaw : '',
        fecha: String(fechaRaw),
        fechaLabel,
        mes: mesDesdeFechaRaw(fechaRaw),
        contrataciones: toNumber(row[cContrat >= 0 ? cContrat : 5]),
        cumplimiento,
        comentarios,
        altasNombres,
        bajasNombres,
        altas,
        bajas,
      }
    })
}

function parseBajas(rows: unknown[][]): BajaRegistro[] {
  if (rows.length < 2) return []
  const headers = rows[0] ?? []
  const col = (...needles: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      const h = normalizeHeader(headers[i])
      if (needles.some((n) => h.includes(n))) return i
    }
    return -1
  }

  const cNo = col('EMPLEADO', 'NO DE')
  const cNombre = col('NOMBRE')
  const cPos = col('POSICION')
  const cIngreso = col('INGRESO')
  const cBaja = col('BAJA')
  const cMotivo = col('MOTIVO', 'SEPARACION')

  return rows
    .slice(1)
    .filter((row) => String(row?.[cNombre >= 0 ? cNombre : 1] ?? '').trim().length > 2)
    .map((row, index) => {
      const fechaBajaRaw = row[cBaja >= 0 ? cBaja : 4]
      const motivo = String(row[cMotivo >= 0 ? cMotivo : 7] ?? '').trim()
      const mesBaja = excelDateToMonthKey(fechaBajaRaw)

      return {
        id: `baja-${index + 1}`,
        noEmpleado: toNumber(row[cNo >= 0 ? cNo : 0]),
        nombre: String(row[cNombre >= 0 ? cNombre : 1] ?? '').trim(),
        posicion: String(row[cPos >= 0 ? cPos : 2] ?? '').trim(),
        ingreso: formatExcelDate(row[cIngreso >= 0 ? cIngreso : 3]),
        fechaBaja: formatExcelDate(fechaBajaRaw),
        mesBaja,
        motivo,
        motivoCategoria: categoriaMotivo(motivo),
      }
    })
}

function parseAusentismos(rows: unknown[][]): AusentismoRegistro[] {
  if (rows.length < 2) return []
  const headers = rows[0] ?? []
  const col = (...needles: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      const h = normalizeHeader(headers[i])
      if (needles.some((n) => h.includes(n))) return i
    }
    return -1
  }

  const cFecha = col('FECHA')
  const cTurno = col('TURNO')
  const cNombre = col('NOMBRE')
  const cAsunto = col('ASUNTO')
  const cComent = col('COMENTARIO')
  const cDesc = col('DESCRIPCION')
  const cCompromiso = col('COMPROMISO')
  const cCierre = col('CIERRE')
  const cEncargado = col('ENCARGADO')

  return rows
    .slice(1)
    .filter((row) => String(row?.[cNombre >= 0 ? cNombre : 2] ?? '').trim().length > 2)
    .map((row, index) => {
      const fechaRaw = row[cFecha >= 0 ? cFecha : 0]
      const comentarios = String(row[cComent >= 0 ? cComent : 4] ?? '').trim()
      const descripcion = String(row[cDesc >= 0 ? cDesc : 5] ?? '').trim()

      return {
        id: `aus-${index + 1}`,
        fecha: formatExcelDate(fechaRaw),
        mes: mesDesdeFechaRaw(fechaRaw),
        turno: String(row[cTurno >= 0 ? cTurno : 1] ?? '').trim().toUpperCase(),
        nombre: String(row[cNombre >= 0 ? cNombre : 2] ?? '').trim(),
        asunto: String(row[cAsunto >= 0 ? cAsunto : 3] ?? '').trim(),
        comentarios,
        descripcion,
        compromiso: String(row[cCompromiso >= 0 ? cCompromiso : 6] ?? '').trim(),
        cierre: String(row[cCierre >= 0 ? cCierre : 7] ?? '').trim(),
        encargado: String(row[cEncargado >= 0 ? cEncargado : 8] ?? '').trim(),
        motivoCategoria: categoriaAusentismo(comentarios, descripcion),
      }
    })
}

export function parseRrhhWorkbook(workbook: XLSX.WorkBook): RrhhDataset {
  const sheetComp = findSheet(workbook, 'Compromisos', 'COMPROMISO')
  const compromisos = sheetComp ? parseCompromisos(sheetToRows(sheetComp)) : []

  const sheetBajas = findSheet(workbook, 'Bajas', 'BAJA')
  const bajas = sheetBajas ? parseBajas(sheetToRows(sheetBajas)) : []

  const sheetAus = findSheet(workbook, 'Ausentismos', 'AUSENTISMO')
  const ausentismos = sheetAus ? parseAusentismos(sheetToRows(sheetAus)) : []

  return { compromisos, bajas, ausentismos }
}
