import { readFileSync, writeFileSync } from 'node:fs'

const repo =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ??
  'TACTICAL-SUPPORT-SERVICIO_DANFOSS'

let base = process.env.VITE_BASE_PATH || '/'
if (base === './' || base === '.') {
  base = `/${repo}/`
}
if (!base.endsWith('/')) base += '/'

for (const file of ['dist/index.html', 'dist/404.html']) {
  let html = readFileSync(file, 'utf8')
  if (!html.includes('<base ')) {
    html = html.replace('<head>', `<head>\n    <base href="${base}" />`)
  }
  writeFileSync(file, html)
}

console.log(`Patched HTML base href → ${base}`)
