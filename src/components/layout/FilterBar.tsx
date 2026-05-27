import { Users, ListFilter, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FiltroMode = 'todos' | 'top10' | 'pendientes'

type FilterBarProps = {
  filtro: FiltroMode
  onFiltroChange: (f: FiltroMode) => void
}

const filtroOpts: {
  id: FiltroMode
  label: string
  desc: string
  icon: typeof Users
}[] = [
  { id: 'todos', label: 'Todos', desc: 'Equipo completo', icon: Users },
  {
    id: 'top10',
    label: 'Revisión focal',
    desc: '10 puntajes más altos',
    icon: ListFilter,
  },
  {
    id: 'pendientes',
    label: 'Pendientes',
    desc: 'Sin evaluación',
    icon: AlertTriangle,
  },
]

export function FilterBar({ filtro, onFiltroChange }: FilterBarProps) {
  return (
    <div className="rounded-2xl border border-navy/15 bg-white p-4 sm:p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-black/60">
        Filtrar oficiales
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {filtroOpts.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFiltroChange(id)}
            className={cn(
              'flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all sm:min-w-[140px] sm:flex-none',
              filtro === id
                ? 'border-navy bg-navy text-white'
                : 'border-navy/20 bg-white text-black hover:border-navy/40',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>
              <span className="block text-sm font-bold sm:text-base">{label}</span>
              <span
                className={cn(
                  'block text-xs sm:text-sm',
                  filtro === id ? 'text-white/70' : 'text-black/55',
                )}
              >
                {desc}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
