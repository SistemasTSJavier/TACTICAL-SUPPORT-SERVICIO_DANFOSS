import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function PageIntro() {
  return (
    <Card className="border-navy/15 bg-white">
      <CardContent className="flex gap-4 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-black/60">
          <p className="font-semibold text-black">
            Cómo leer este panel
          </p>
          <ul className="list-inside list-disc space-y-1 marker:text-black/35">
            <li>
              Los <strong className="text-black">indicadores superiores</strong>{' '}
              resumen el desempeño global del servicio.
            </li>
            <li>
              En la <strong className="text-black">lista de resultados</strong>,
              haz clic en un colaborador para ver su evaluación 360.
            </li>
            <li>
              Los tonos de <strong className="text-black">azul oscuro</strong>{' '}
              siguen la nomenclatura oficial (EXCELENTE → DEFICIENTE).
            </li>
            <li>
              Filas con borde <strong className="text-black">punteado</strong> =
              colaborador pendiente de evaluación.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
