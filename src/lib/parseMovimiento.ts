export function parseNombresLista(value: unknown): string[] {
  const text = String(value ?? '').trim()
  if (!text || text.toUpperCase() === 'N/A') return []
  return text
    .split(/\s*\/\s*|\s*,\s*|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
}

export function parseMovimientoSemana(comentarios: string): {
  altas: number
  bajas: number
} {
  const text = comentarios.toUpperCase().trim()
  if (!text) return { altas: 0, bajas: 0 }

  let altas = 0
  let bajas = 0

  const altaMatch = text.match(/(\d+)\s*ALTA/)
  const bajaMatch = text.match(/(\d+)\s*BAJA/)
  if (altaMatch) altas = Number(altaMatch[1])
  if (bajaMatch) bajas = Number(bajaMatch[1])

  if (!altaMatch && /\bALTA\b/.test(text) && !/\d/.test(text.split('ALTA')[0]?.slice(-3) ?? '')) {
    altas = 1
  }
  if (!bajaMatch && /\bBAJA\b/.test(text) && !/\d/.test(text.split('BAJA')[0]?.slice(-3) ?? '')) {
    bajas = 1
  }

  return { altas, bajas }
}

export function categoriaMotivo(motivo: string): string {
  const base = motivo.split('/')[0]?.trim().toUpperCase() ?? ''
  if (base.includes('ABANDONO')) return 'Abandono'
  if (base.includes('CUESTIONES PERSONALES') || base.includes('PERSONAL')) return 'Personal'
  if (base.includes('SALUD')) return 'Salud'
  if (base.includes('CLIMA LABORAL')) return 'Clima laboral'
  if (base.includes('CONDICIONES')) return 'Condiciones'
  if (base.includes('HOSTIGAMIENTO')) return 'Hostigamiento'
  return base.slice(0, 28) || 'Otro'
}

export function categoriaAusentismo(comentarios: string, descripcion?: string): string {
  const text = `${comentarios} ${descripcion ?? ''}`.toUpperCase().trim()
  if (!text || text === 'N/A') return 'Sin detalle'
  if (text.includes('NO CONTACT') || text.includes('NO SE ENCUENTRA')) return 'No contactado'
  if (text.includes('FAMILIAR')) return 'Familiar'
  if (text.includes('PERSONAL')) return 'Personal'
  if (text.includes('SALUD') || text.includes('ENFERM') || text.includes('IMSS')) return 'Salud'
  if (text.includes('LEGAL') || text.includes('FINIQUITO')) return 'Legal'
  if (text.includes('FALTA')) return 'Falta'
  const limpio = comentarios.trim()
  if (limpio && limpio !== 'N/A') return limpio.slice(0, 22)
  return 'Otro'
}
