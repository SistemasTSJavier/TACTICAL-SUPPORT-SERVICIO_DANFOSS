/** Basename para React Router en GitHub Pages (subcarpeta del repo). */
export function appBasename(): string {
  const base = import.meta.env.BASE_URL

  if (base && base !== './' && base !== '.') {
    return base.endsWith('/') ? base.slice(0, -1) : base
  }

  const segment = window.location.pathname.split('/').filter(Boolean)[0]
  if (segment && !segment.includes('.')) {
    return `/${segment}`
  }

  return '/'
}

/**
 * Ruta de un archivo en /public.
 * En GitHub Pages (subrutas como /presentacion) usa la raíz del sitio, no ./ relativo.
 */
export function publicAssetPath(fileName: string): string {
  const clean = fileName.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'

  if (import.meta.env.DEV || base === '/' || base === '') {
    return `/${clean}`
  }

  if (typeof window !== 'undefined') {
    const siteRoot = `${window.location.origin}${appBasename()}/`
    return `${siteRoot}${clean}`
  }

  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${clean}`
}
