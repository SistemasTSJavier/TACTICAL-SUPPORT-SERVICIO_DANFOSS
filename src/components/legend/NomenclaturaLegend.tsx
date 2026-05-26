import { NOMENCLATURA, getRangoLabel } from '@/lib/nomenclatura'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type NomenclaturaLegendProps = {
  compact?: boolean
  dark?: boolean
}

export function NomenclaturaLegend({
  compact = false,
  dark = false,
}: NomenclaturaLegendProps) {
  return (
    <Card
      className={
        dark ? 'border-zinc-700 bg-zinc-900/80 text-white' : 'bg-zinc-50/50'
      }
    >
      <CardHeader className={compact ? 'p-4 pb-1' : undefined}>
        <CardTitle className={dark ? 'text-white' : undefined}>
          Escala de desempeño
        </CardTitle>
        <CardDescription className={dark ? 'text-zinc-400' : undefined}>
          Todos los gráficos y la tabla usan estos rangos y colores.
        </CardDescription>
      </CardHeader>
      <CardContent className={compact ? 'p-4 pt-2' : undefined}>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-700">
                  Nivel
                </th>
                <th className="px-4 py-2.5 text-center font-semibold text-zinc-700">
                  Puntaje
                </th>
                <th className="px-4 py-2.5 text-center font-semibold text-zinc-700">
                  Significado
                </th>
              </tr>
            </thead>
            <tbody>
              {NOMENCLATURA.map((nivel) => (
                <tr key={nivel.label} className="border-t border-zinc-100">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 shrink-0 rounded"
                        style={{ backgroundColor: nivel.color }}
                      />
                      <span className="font-semibold text-zinc-800">
                        {nivel.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-zinc-600">
                    {getRangoLabel(nivel)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {nivel.label === 'EXCELENTE' && 'Desempeño sobresaliente'}
                    {nivel.label === 'ALTO' && 'Supera expectativas del puesto'}
                    {nivel.label === 'MEDIO' && 'Cumple lo esperado'}
                    {nivel.label === 'BAJO' && 'Requiere plan de mejora'}
                    {nivel.label === 'DEFICIENTE' && 'Acción inmediata'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
