import { LayoutGrid, Table2, Users, ListFilter, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VistaMode = 'graficos' | 'tabla'
export type FiltroMode = 'todos' | 'top10' | 'pendientes'

type FilterBarProps = {
  vista: VistaMode
  filtro: FiltroMode
  onVistaChange: (v: VistaMode) => void
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

export function FilterBar({
  vista,
  filtro,
  onVistaChange,
  onFiltroChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-navy/15 bg-white p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex-1">
        <p className="text-sm font-bold uppercase tracking-wide text-black/60">
          Filtrar colaboradores
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
                <span className="block text-sm font-bold sm:text-base">
                  {label}
                </span>
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
      <div className="shrink-0">
        <p className="text-sm font-bold uppercase tracking-wide text-black/60">
          Formato
        </p>
        <div className="mt-3 flex rounded-xl border border-navy/20 p-1">
          <button
            type="button"
            onClick={() => onVistaChange('graficos')}
            className={cn(
              'flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold sm:text-base',
              vista === 'graficos'
                ? 'bg-navy text-white'
                : 'text-black/60 hover:text-black',
            )}
          >
            <LayoutGrid className="h-5 w-5" />
            Gráficos
          </button>
          <button
            type="button"
            onClick={() => onVistaChange('tabla')}
            className={cn(
              'flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold sm:text-base',
              vista === 'tabla'
                ? 'bg-navy text-white'
                : 'text-black/60 hover:text-black',
            )}
          >
            <Table2 className="h-5 w-5" />
            Tabla
          </button>
        </div>
      </div>
    </div>
  )
}
