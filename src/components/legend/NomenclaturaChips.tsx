import { Palette } from 'lucide-react'
import { getNomenclaturaActiva, getRangoLabel } from '@/lib/nomenclatura'
import { cn } from '@/lib/utils'

type NomenclaturaChipsProps = {
  dark?: boolean
  className?: string
  showTitle?: boolean
  nivelActivo?: string | null
  onNivelClick?: (label: string | null) => void
}

export function NomenclaturaChips({
  dark = false,
  className,
  showTitle = true,
  nivelActivo = null,
  onNivelClick,
}: NomenclaturaChipsProps) {
  const NOMENCLATURA = getNomenclaturaActiva()

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white shadow-sm ring-1 ring-navy/8',
        className,
      )}
    >
      {showTitle && (
        <div className="mb-3 flex items-center gap-2">
          <Palette
            className={cn('h-4 w-4', dark ? 'text-white/70' : 'text-black/55')}
          />
          <p
            className={cn(
              'text-sm font-bold uppercase tracking-wide sm:text-base',
              dark ? 'text-white/80' : 'text-black/55',
            )}
          >
            Escala de calificación (0 a 5)
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {NOMENCLATURA.map((n) => {
          const active = nivelActivo === n.label
          const Wrapper = onNivelClick ? 'button' : 'div'

          return (
          <Wrapper
            key={n.label}
            type={onNivelClick ? 'button' : undefined}
            onClick={
              onNivelClick
                ? () => onNivelClick(active ? null : n.label)
                : undefined
            }
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 transition-all',
              onNivelClick && 'cursor-pointer hover:scale-[1.02]',
              active
                ? dark
                  ? 'bg-white/20 ring-2 ring-sky-300/70'
                  : 'bg-navy/10 ring-2 ring-navy/30'
                : dark
                  ? 'bg-white/10'
                  : 'bg-black/[0.03]',
            )}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: n.color }}
            />
            <div>
              <span
                className={cn(
                  'block text-sm font-bold sm:text-base',
                  dark ? 'text-white' : 'text-black',
                )}
              >
                {n.label}
              </span>
              <span
                className={cn(
                  'block text-xs sm:text-sm',
                  dark ? 'text-white/60' : 'text-black/55',
                )}
              >
                {getRangoLabel(n)}
              </span>
            </div>
          </Wrapper>
          )
        })}
      </div>
      <p
        className={cn(
          'mt-3 text-xs sm:text-sm',
          dark ? 'text-white/55' : 'text-black/50',
        )}
      >
        {onNivelClick
          ? 'Toca un nivel para filtrar colaboradores en la lista.'
          : 'Verde = favorable · Amarillo = medio · Rojo = requiere atención.'}
      </p>
    </div>
  )
}
