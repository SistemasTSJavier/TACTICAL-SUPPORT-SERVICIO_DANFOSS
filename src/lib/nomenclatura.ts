import { COLORS, colorPorNivelLabel, nivelOpacity } from '@/lib/colors'

export type NivelDesempeno = {
  label: string
  color: string
  fillOpacity: number
  bgClass: string
  textClass: string
  min: number
  max: number
}

const RANGOS: { min: number; max: number }[] = [
  { min: 4.5, max: 5 },
  { min: 3.5, max: 4.5 },
  { min: 2.5, max: 3.5 },
  { min: 1.5, max: 2.5 },
  { min: 0, max: 1.5 },
]

const LABELS = ['EXCELENTE', 'ALTO', 'MEDIO', 'BAJO', 'DEFICIENTE']

function buildNiveles(): NivelDesempeno[] {
  return LABELS.map((label, i) => ({
    label,
    color: colorPorNivelLabel(label),
    fillOpacity: nivelOpacity(i),
    bgClass: '',
    textClass: '',
    ...RANGOS[i],
  }))
}

export const NOMENCLATURA: NivelDesempeno[] = buildNiveles()

let nomenclaturaActiva: NivelDesempeno[] = NOMENCLATURA

export function setNomenclaturaActiva(
  niveles: Omit<NivelDesempeno, 'color' | 'fillOpacity'>[],
) {
  nomenclaturaActiva = niveles
    .map((n, i) => ({
      ...n,
      color: colorPorNivelLabel(n.label),
      fillOpacity: nivelOpacity(i),
      bgClass: '',
      textClass: '',
    }))
    .sort((a, b) => b.min - a.min)
}

export function getNomenclaturaActiva() {
  return nomenclaturaActiva
}

export function getNivelDesempeno(score: number): NivelDesempeno {
  const niveles = nomenclaturaActiva
  for (const nivel of niveles) {
    if (score > nivel.min) return { ...nivel }
  }
  return { ...niveles[niveles.length - 1] }
}

export function getRangoLabel(nivel: NivelDesempeno): string {
  if (nivel.max <= 1.5 || nivel.label.toUpperCase().includes('NO CUMPLE')) {
    return '< 1.5'
  }
  if (nivel.min > 0) return `> ${nivel.min}`
  return `≤ ${nivel.max}`
}

export function nivelBgStyle(nivel: NivelDesempeno, textOnFill = false) {
  return {
    backgroundColor: COLORS.navy,
    opacity: nivel.fillOpacity,
    color: textOnFill ? COLORS.white : COLORS.black,
  } as const
}
