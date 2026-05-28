import * as XLSX from 'xlsx'

export function formatExcelDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number' && value > 20000) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const d = String(parsed.d).padStart(2, '0')
      const m = String(parsed.m).padStart(2, '0')
      return `${d}/${m}/${parsed.y}`
    }
  }
  return String(value).trim()
}

export function excelDateToMonthKey(value: unknown): string {
  if (typeof value === 'number' && value > 20000) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const m = String(parsed.m).padStart(2, '0')
      return `${parsed.y}-${m}`
    }
  }
  const text = String(value ?? '')
  const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (match) {
    return `${match[3]}-${match[2].padStart(2, '0')}`
  }
  return 'sin-fecha'
}

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function fechaLabelCorta(label: string): string {
  const match = label.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return label
  const dia = match[1].padStart(2, '0')
  const mes = MESES_CORTOS[Number(match[2]) - 1] ?? match[2]
  return `${dia} ${mes}`
}

/** Clave ISO año-semana, p. ej. 2025-W21 */
export function excelDateToWeekKey(value: unknown): string {
  let date: Date | null = null
  if (typeof value === 'number' && value > 20000) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) date = new Date(parsed.y, parsed.m - 1, parsed.d)
  } else {
    const text = String(value ?? '')
    const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (match) {
      date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
    }
  }
  if (!date || Number.isNaN(date.getTime())) return 'sin-semana'

  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function weekKeyToLabel(key: string): string {
  if (key === 'sin-semana') return '—'
  const match = key.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return key
  return `Semana ${Number(match[2])} · ${match[1]}`
}

export function semanaActualKey(): string {
  return excelDateToWeekKey(new Date())
}

export function monthKeyToLabel(key: string): string {
  if (key === 'sin-fecha') return '—'
  const [y, m] = key.split('-')
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ]
  const idx = Number(m) - 1
  return `${months[idx] ?? m} ${y}`
}
