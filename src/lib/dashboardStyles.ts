import { cn } from '@/lib/utils'

/** Altura estándar de paneles HR en presentación */
export const HR_PANEL_HEIGHT = 380

export function hrPanel(dark: boolean, className?: string) {
  return cn(
    'overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm',
    dark
      ? 'border-white/12 bg-white/[0.07] shadow-black/30'
      : 'border-navy/10 bg-white shadow-[0_4px_24px_-4px_rgba(0,11,41,0.08)]',
    className,
  )
}

export function hrPanelInner(dark: boolean) {
  return cn('p-4 sm:p-5 lg:p-6', dark ? '' : '')
}

export function hrFilterPill(active: boolean, dark: boolean) {
  return cn(
    'hr-filter-pill shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 sm:px-4 sm:text-sm',
    active
      ? dark
        ? 'hr-filter-pill-active border-sky-300/80 bg-sky-300 text-[#000b29] shadow-md ring-2 ring-sky-200/40'
        : 'border-navy bg-navy text-white shadow-sm'
      : dark
        ? 'border border-white/30 bg-white/10 text-white hover:border-white/45 hover:bg-white/15'
        : 'border border-navy/12 bg-white text-navy hover:border-navy/25 hover:bg-navy/[0.03]',
  )
}

export function hrFilterToggleGroup(dark: boolean) {
  return cn(
    'inline-flex shrink-0 rounded-full border p-1',
    dark ? 'border-white/25 bg-[#00051a]' : 'border-navy/12 bg-slate-100',
  )
}

export function hrFilterToggleOption(active: boolean, dark: boolean) {
  return cn(
    'rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm',
    active
      ? dark
        ? 'bg-sky-300 text-[#000b29] shadow-sm'
        : 'bg-navy text-white'
      : dark
        ? 'text-white/75 hover:bg-white/10 hover:text-white'
        : 'text-navy/65 hover:bg-navy/5 hover:text-navy',
  )
}

export function hrFilterScrollRow(className?: string) {
  return cn(
    'scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0',
    className,
  )
}

export function hrSelect(dark: boolean, className?: string) {
  return cn(
    'w-full max-w-md rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-colors',
    'focus:ring-2 focus:ring-offset-0',
    dark
      ? 'border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-white/20 [&>option]:bg-navy [&>option]:text-white'
      : 'border-navy/15 bg-white text-navy focus:border-navy/30 focus:ring-navy/15',
    className,
  )
}

export function hrLabel(dark: boolean) {
  return cn(
    'text-xs font-bold uppercase tracking-widest',
    dark ? 'text-white/70' : 'text-black/45',
  )
}

export function hrKpiGrid(className?: string) {
  return cn(
    'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4',
    className,
  )
}

export function hrDetailCard(dark: boolean, className?: string) {
  return cn(
    'rounded-xl border px-4 py-3.5 transition-colors',
    dark
      ? 'border-white/10 bg-white/[0.05] hover:border-white/18'
      : 'border-navy/8 bg-surface hover:border-navy/15',
    className,
  )
}

export function hrFieldLabel(dark: boolean) {
  return cn(
    'text-xs font-bold uppercase tracking-wide sm:text-sm',
    dark ? 'text-white/55' : 'text-black/50',
  )
}

export function hrFieldValue(dark: boolean) {
  return cn(
    'mt-1 text-sm leading-relaxed sm:text-base',
    dark ? 'text-white/92' : 'text-black/80',
  )
}

export function hrScrollArea(dark: boolean) {
  return cn(
    'scrollbar-thin overflow-y-auto',
    dark ? 'scrollbar-dark' : 'scrollbar-light',
  )
}

export function presentationSlideContent(className?: string) {
  return cn(
    'mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-2 xl:max-w-7xl',
    className,
  )
}
