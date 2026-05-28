import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
/** Rutas relativas: solo HTML/CSS/JS en GitHub Pages, sin depender de rutas absolutas. */
const base = './'

const env = {
  ...process.env,
  VITE_BASE_PATH: base,
  VITE_STATIC_ONLY: 'true',
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(script) {
  const r = spawnSync(npm, ['run', script], { cwd: root, env, stdio: 'inherit', shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('build')
spawnSync(process.execPath, [join(root, 'scripts', 'copy-to-docs.mjs')], {
  cwd: root,
  stdio: 'inherit',
})
