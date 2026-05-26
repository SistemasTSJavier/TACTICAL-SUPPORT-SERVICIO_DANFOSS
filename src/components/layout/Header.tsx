import { Link } from 'react-router-dom'
import { Presentation } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EvaluacionMeta } from '@/types/evaluacion'

type HeaderProps = {
  meta: EvaluacionMeta
  showPresentationLink?: boolean
}

export function Header({ meta, showPresentationLink = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-3 py-3 sm:px-5">
        <Logo size="md" dark />
        <div className="hidden h-10 w-px bg-white/20 sm:block" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Dashboard · {meta.servicio}
          </p>
          <p className="truncate text-base font-semibold text-white sm:text-lg">
            {meta.titulo}
          </p>
          <p className="text-sm text-white/60">{meta.periodo}</p>
        </div>
        {showPresentationLink && (
          <Link
            to="/presentacion"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'shrink-0 border border-white/20 bg-white font-bold text-navy hover:bg-white/90',
            )}
          >
            <Presentation className="h-4 w-4" />
            <span className="hidden sm:inline">Modo presentación</span>
          </Link>
        )}
      </div>
    </header>
  )
}
