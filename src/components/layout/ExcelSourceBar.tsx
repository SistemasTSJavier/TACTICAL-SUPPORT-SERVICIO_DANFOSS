import { FileSpreadsheet, RefreshCw, Upload } from 'lucide-react'
import { useEvaluacion } from '@/context/EvaluacionProvider'

export function ExcelSourceBar() {
  const { sourceLabel, reloadFromFile, reloadFromServer, loading } =
    useEvaluacion()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-navy/12 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <div className="flex items-center gap-2 text-sm text-black sm:text-base">
        <FileSpreadsheet className="h-5 w-5 shrink-0 text-navy" />
        <span>
          Datos desde Excel: <strong>{sourceLabel}</strong>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy bg-white px-3 py-2.5 text-sm font-semibold text-navy hover:bg-black/5">
          <Upload className="h-4 w-4" />
          Cambiar archivo
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void reloadFromFile(f)
            }}
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void reloadFromServer()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy bg-navy px-3 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </button>
      </div>
    </div>
  )
}
