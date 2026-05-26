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

/** Ruta pública de un archivo en /public (respeta BASE_URL de Vite). */
export function publicAssetPath(fileName: string): string {
  const base = import.meta.env.BASE_URL
  const clean = fileName.replace(/^\//, '')

  if (base && base !== './' && base !== '.') {
    return `${base}${clean}`
  }

  return `/${clean}`
}
