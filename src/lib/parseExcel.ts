import * as XLSX from 'xlsx'
import {
  EVALUADOR_KEYS,
  type EvaluacionDataset,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'
import {
  NOMENCLATURA,
  type NivelDesempeno,
  setNomenclaturaActiva,
} from '@/lib/nomenclatura'
import { publicAssetPath } from '@/lib/basePath'
import { COLORS, nivelOpacity } from '@/lib/colors'
import { parseRrhhWorkbook } from '@/lib/parseHrExcel'

const DEFAULT_META: EvaluacionDataset['meta'] = {
  titulo: 'Evaluación 360',
  servicio: 'DANFOSS',
  periodo: new Date().getFullYear().toString(),
  fechaPresentacion: new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  conclusiones:
    'Los resultados orientan planes de mejora y capacitación del servicio DANFOSS.',
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

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
    raw: false,
  }) as unknown[][]
}

function slugify(name: string, index: number) {
  return `${index}-${name.slice(0, 16).replace(/\s+/g, '-').toLowerCase()}`
}

function parseRangoTexto(texto: string): { min: number; max: number; label: string } {
  const t = texto.trim()
  const gt = t.match(/>\s*([\d.]+)/)
  if (gt) {
    const min = Number(gt[1])
    return { min, max: 5, label: t }
  }
  const lt = t.match(/<\s*([\d.]+)/)
  if (lt) {
    const max = Number(lt[1])
    return { min: 0, max, label: t }
  }
  return { min: 0, max: 5, label: t }
}

function parseNomenclaturaSheet(rows: unknown[][]): NivelDesempeno[] | null {
  const parsed: NivelDesempeno[] = []

  for (const row of rows) {
    if (!row || row.length < 2) continue
    const labelRaw = String(row[1] ?? row[0] ?? '').trim()
    const rangoRaw = String(row[2] ?? row[1] ?? '').trim()
    if (!labelRaw || normalizeHeader(labelRaw).includes('NOMENCLATUR')) continue
    if (normalizeHeader(labelRaw).includes('EVALUACION')) continue

    const labelUpper = labelRaw.toUpperCase()
    const esDeficiente =
      labelUpper.includes('NO CUMPLE') || labelUpper.includes('DEFICIENTE')
    const { min, max } = parseRangoTexto(rangoRaw)
    parsed.push({
      label: esDeficiente ? 'DEFICIENTE' : labelRaw,
      color: COLORS.navy,
      fillOpacity: nivelOpacity(parsed.length),
      bgClass: '',
      textClass: '',
      min,
      max,
    })
  }

  if (parsed.length < 3) return null

  return parsed.sort((a, b) => b.min - a.min)
}

function findResultadosHeader(rows: unknown[][]) {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    if (!row?.[0]) continue
    const h0 = normalizeHeader(row[0])
    if (h0.includes('OFICIAL') || h0.includes('EVALUAD')) {
      return { headerIndex: i, headers: row }
    }
  }
  return { headerIndex: 0, headers: rows[0] ?? [] }
}

function columnIndex(headers: unknown[], ...needles: string[]) {
  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeader(headers[i])
    if (needles.some((n) => h.includes(n))) return i
  }
  return -1
}

function parseResultadosSheet(rows: unknown[][]): {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
} {
  const { headerIndex, headers } = findResultadosHeader(rows)
  const dataRows = rows.slice(headerIndex + 1).filter((row) => {
    const nombre = String(row?.[0] ?? '').trim()
    return nombre.length > 2
  })

  const colDesempeno = columnIndex(headers, 'DESEMPENO', 'DESEMPE')
  const colTs = columnIndex(headers, 'TS')

  const evaluadorCols: { key: EvaluadorKey; index: number; label: string }[] =
    []
  let evalIdx = 0
  for (let c = 1; c < headers.length && evalIdx < 5; c++) {
    if (c === colTs || c === colDesempeno) continue
    const label = String(headers[c] ?? '').trim()
    if (!label) continue
    const h = normalizeHeader(label)
    if (h === 'TS' || h.includes('DESEMPENO')) continue
    evaluadorCols.push({
      key: EVALUADOR_KEYS[evalIdx],
      index: c,
      label,
    })
    evalIdx++
  }

  while (evaluadorCols.length < 5) {
    const i = evaluadorCols.length
    evaluadorCols.push({
      key: EVALUADOR_KEYS[i],
      index: 1 + i,
      label: EVALUADOR_KEYS[i].toUpperCase(),
    })
  }

  const evaluadoresLabels = Object.fromEntries(
    evaluadorCols.map((e) => [e.key, e.label]),
  ) as EvaluadoresLabels

  const tsCol = colTs >= 0 ? colTs : evaluadorCols[4].index + 1
  const desempenoCol =
    colDesempeno >= 0 ? colDesempeno : tsCol + 1

  const oficiales: EvaluacionOficial[] = dataRows.map((row, index) => {
    const nombre = String(row[0]).trim()
    const evaluadores = Object.fromEntries(
      evaluadorCols.map((e) => [e.key, toNumber(row[e.index])]),
    ) as EvaluacionOficial['evaluadores']

    const ts = toNumber(row[tsCol])
    const desempeno = toNumber(row[desempenoCol]) ?? 0
    const scores = [...Object.values(evaluadores), ts]
    const sinEvaluar =
      desempeno === 0 ||
      scores.every((s) => s === null || s === 0)

    return {
      id: slugify(nombre, index + 1),
      nombre,
      evaluadores,
      ts,
      desempeno,
      sinEvaluar,
    }
  })

  return { oficiales, evaluadoresLabels }
}

export function parseWorkbook(workbook: XLSX.WorkBook): EvaluacionDataset {
  const sheetResultados =
    findSheet(workbook, 'RESULTADOS', 'RESULTADO') ??
    workbook.Sheets[workbook.SheetNames[0]]

  if (!sheetResultados) {
    throw new Error('No se encontró la hoja RESULTADOS en el Excel.')
  }

  const rowsResultados = sheetToRows(sheetResultados)
  const { oficiales, evaluadoresLabels } = parseResultadosSheet(rowsResultados)

  if (oficiales.length === 0) {
    throw new Error('La hoja RESULTADOS no contiene filas de colaboradores.')
  }

  const sheetNomenclatura = findSheet(workbook, 'NOMENCLATURA', 'NOMENCLATUR')
  if (sheetNomenclatura) {
    const niveles = parseNomenclaturaSheet(sheetToRows(sheetNomenclatura))
    if (niveles) setNomenclaturaActiva(niveles)
  } else {
    setNomenclaturaActiva(NOMENCLATURA)
  }

  const rrhh = parseRrhhWorkbook(workbook)

  return {
    meta: DEFAULT_META,
    evaluadoresLabels,
    oficiales,
    rrhh,
  }
}

export async function parseExcelArrayBuffer(
  buffer: ArrayBuffer,
): Promise<EvaluacionDataset> {
  const workbook = XLSX.read(buffer, { type: 'array' })
  return parseWorkbook(workbook)
}

export async function loadExcelFromUrl(url: string): Promise<EvaluacionDataset> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar el Excel (${response.status}). Coloca el archivo en public/Evaluacion Danfoss.xlsx`,
    )
  }
  const buffer = await response.arrayBuffer()
  return parseExcelArrayBuffer(buffer)
}

export const EXCEL_PUBLIC_PATH = publicAssetPath('Evaluacion Danfoss.xlsx')
