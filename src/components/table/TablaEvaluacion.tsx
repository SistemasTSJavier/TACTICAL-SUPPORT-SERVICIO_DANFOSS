import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NivelTag, ScoreBadge } from '@/components/ui/ScoreBadge'
import {
  EVALUADOR_KEYS,
  type EvaluacionOficial,
  type EvaluadoresLabels,
  type EvaluadorKey,
} from '@/types/evaluacion'

type TablaEvaluacionProps = {
  oficiales: EvaluacionOficial[]
  evaluadoresLabels: EvaluadoresLabels
  compact?: boolean
}

export function TablaEvaluacion({
  oficiales,
  evaluadoresLabels,
  compact = false,
}: TablaEvaluacionProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'nombre', desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<EvaluacionOficial>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Colaborador',
        cell: ({ row }) => (
          <span
            className={
              row.original.sinEvaluar
                ? 'font-semibold text-black/60'
                : 'font-semibold text-black'
            }
          >
            {row.original.nombre}
          </span>
        ),
        meta: { sticky: true },
      },
      ...EVALUADOR_KEYS.map((key: EvaluadorKey) => ({
        id: key,
        accessorFn: (row: EvaluacionOficial) => row.evaluadores[key],
        header: () => (
          <span
            className="block max-w-[7.5rem] whitespace-normal leading-tight"
            title={evaluadoresLabels[key]}
          >
            {evaluadoresLabels[key]}
          </span>
        ),
        cell: ({ getValue }: { getValue: () => unknown }) => (
          <ScoreBadge value={getValue() as number | null} />
        ),
      })),
      {
        accessorKey: 'ts',
        header: () => (
          <span className="block max-w-[6rem] whitespace-normal leading-tight">
            TS (Tactical Support)
          </span>
        ),
        cell: ({ getValue }) => (
          <ScoreBadge value={getValue() as number | null} />
        ),
      },
      {
        accessorKey: 'desempeno',
        header: 'Desempeño final',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge value={row.original.desempeno} large />
            {!row.original.sinEvaluar && (
              <NivelTag score={row.original.desempeno} />
            )}
          </div>
        ),
      },
    ],
    [evaluadoresLabels],
  )

  const table = useReactTable({
    data: oficiales,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Matriz de evaluación 360</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">
            <strong>Filas (vertical):</strong> cada colaborador evaluado.{' '}
            <strong>Columnas (horizontal):</strong> las personas o roles que
            califican a ese colaborador, más TS y el desempeño final.
          </CardDescription>
        </div>
        {!compact && (
          <Input
            placeholder="Buscar colaborador..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs shrink-0"
          />
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 sm:p-5 sm:pt-0">
        <table className="w-full min-w-[960px] border-collapse text-sm sm:text-base">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-black/[0.06]">
                {hg.headers.map((header, colIndex) => (
                  <th
                    key={header.id}
                    className={[
                      'border-b border-navy/10 px-3 py-3 text-left align-bottom font-semibold text-black/80',
                      colIndex === 0
                        ? 'sticky left-0 z-20 min-w-[11rem] bg-black/[0.06] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]'
                        : 'min-w-[5.5rem]',
                    ].join(' ')}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="flex items-start gap-1 text-left hover:text-black"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <ArrowUpDown className="mt-0.5 h-3 w-3 shrink-0 opacity-50" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.original.sinEvaluar
                    ? 'border-t border-dashed border-navy/30 bg-black/[0.03]'
                    : 'border-t border-navy/10 hover:bg-black/[0.02]'
                }
              >
                {row.getVisibleCells().map((cell, colIndex) => (
                  <td
                    key={cell.id}
                    className={[
                      'px-3 py-2.5 align-middle',
                      colIndex === 0
                        ? 'sticky left-0 z-10 bg-white font-medium shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]'
                        : '',
                      row.original.sinEvaluar && colIndex === 0
                        ? 'bg-black/[0.03]'
                        : '',
                    ].join(' ')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
