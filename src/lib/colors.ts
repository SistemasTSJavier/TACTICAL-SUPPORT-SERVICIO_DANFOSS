/** Paleta UI: blanco, negro, azul oscuro */
export const COLORS = {
  navy: '#000b29',
  black: '#000000',
  white: '#ffffff',
} as const

/** Colores semáforo para gráficas y calificaciones */
export const CHART = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  /** Escala heatmap / gauge: rojo → amarillo → verde */
  scaleLowToHigh: ['#ef4444', '#eab308', '#22c55e'] as const,
  /** Gauge 0–5 */
  gaugeStops: [
    [0.35, '#ef4444'],
    [0.65, '#eab308'],
    [1, '#22c55e'],
  ] as [number, string][],
  /** Compromisos — gráfica de tendencia */
  vacantes: '#2563eb',
  vacantesDim: 'rgba(37, 99, 235, 0.42)',
  altas: '#22c55e',
  altasDim: 'rgba(34, 197, 94, 0.42)',
  bajas: '#ef4444',
  bajasDim: 'rgba(239, 68, 68, 0.42)',
} as const

export function colorPorScore(score: number): string {
  if (score > 3.5) return CHART.green
  if (score > 2.5) return CHART.yellow
  return CHART.red
}

export function colorPorNivelLabel(label: string): string {
  const u = label.toUpperCase()
  if (u.includes('EXCELENTE') || u.includes('ALTO')) return CHART.green
  if (u.includes('MEDIO')) return CHART.yellow
  return CHART.red
}

export const NIVEL_OPACIDAD = [1, 0.85, 0.7, 0.55, 0.4] as const

export function navyAlpha(opacity: number) {
  return `rgba(0, 11, 41, ${opacity})`
}

export function nivelOpacity(index: number) {
  return NIVEL_OPACIDAD[Math.min(index, NIVEL_OPACIDAD.length - 1)]
}
