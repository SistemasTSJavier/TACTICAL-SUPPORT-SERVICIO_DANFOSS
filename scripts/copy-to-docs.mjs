import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const docs = 'docs'

rmSync(docs, { recursive: true, force: true })
mkdirSync(docs, { recursive: true })

for (const name of readdirSync(dist)) {
  cpSync(join(dist, name), join(docs, name), { recursive: true })
}

console.log('Copied dist/ -> docs/ for GitHub Pages (branch /docs)')
