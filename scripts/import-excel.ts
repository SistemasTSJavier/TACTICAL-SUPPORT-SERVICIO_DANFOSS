import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'
import { parseWorkbook } from '../src/lib/parseExcel'

const INPUT = path.resolve('data/original/Evaluacion Danfoss.xlsx')
const OUTPUT_PUBLIC = path.resolve('public/Evaluacion Danfoss.xlsx')
const OUTPUT_JSON = path.resolve('src/data/evaluacion.json')

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`No se encontró: ${INPUT}`)
    console.error('Coloca tu Excel (Evaluacion Danfoss.xlsx) ahí.')
    process.exit(1)
  }

  const workbook = XLSX.readFile(INPUT)
  const dataset = parseWorkbook(workbook)

  fs.mkdirSync(path.dirname(OUTPUT_PUBLIC), { recursive: true })
  fs.copyFileSync(INPUT, OUTPUT_PUBLIC)
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(dataset, null, 2), 'utf-8')

  console.log(`OK: ${dataset.oficiales.length} colaboradores`)
  console.log(`→ ${OUTPUT_PUBLIC}`)
  console.log(`→ ${OUTPUT_JSON} (respaldo)`)
}

main()
