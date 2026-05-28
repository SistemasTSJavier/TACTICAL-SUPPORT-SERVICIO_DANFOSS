import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const excel = join(root, 'data/original/Evaluacion Danfoss.xlsx')

if (!existsSync(excel)) {
  console.log('prebuild-data: sin Excel en data/original; se usa src/data/evaluacion.json')
  process.exit(0)
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const r = spawnSync(npm, ['run', 'import:data'], { cwd: root, stdio: 'inherit', shell: true })
process.exit(r.status ?? 1)
