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
