import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { EvaluacionDataset } from '@/types/evaluacion'
import { getBundledDataset } from '@/data/bundledDataset'
import {
  EXCEL_PUBLIC_PATH,
  loadExcelFromUrl,
  parseExcelArrayBuffer,
} from '@/lib/parseExcel'

const bundledDataset = getBundledDataset()
const staticOnly = import.meta.env.VITE_STATIC_ONLY === 'true'

type EvaluacionContextValue = {
  data: EvaluacionDataset
  loading: boolean
  error: string | null
  sourceLabel: string
  reloadFromFile: (file: File) => Promise<void>
  reloadFromServer: () => Promise<void>
}

const EvaluacionContext = createContext<EvaluacionContextValue | null>(null)

export function EvaluacionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EvaluacionDataset | null>(
    staticOnly ? bundledDataset : null,
  )
  const [loading, setLoading] = useState(!staticOnly)
  const [error, setError] = useState<string | null>(null)
  const [sourceLabel, setSourceLabel] = useState(
    staticOnly ? 'Datos incluidos (HTML/JS estático)' : '',
  )

  const applyData = useCallback((dataset: EvaluacionDataset, source: string) => {
    setData(dataset)
    setSourceLabel(source)
    setError(null)
  }, [])

  const reloadFromServer = useCallback(async () => {
    if (staticOnly) {
      applyData(getBundledDataset(), 'Datos incluidos (HTML/JS estático)')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const dataset = await loadExcelFromUrl(`${EXCEL_PUBLIC_PATH}?t=${Date.now()}`)
      applyData(dataset, 'Evaluacion Danfoss.xlsx')
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Error al leer el Excel del servidor.',
      )
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [applyData])

  const reloadFromFile = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)
      try {
        const buffer = await file.arrayBuffer()
        const dataset = await parseExcelArrayBuffer(buffer)
        applyData(dataset, file.name)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'No se pudo leer el archivo Excel.',
        )
      } finally {
        setLoading(false)
      }
    },
    [applyData],
  )

  useEffect(() => {
    if (staticOnly) return
    void reloadFromServer()
  }, [reloadFromServer])

  const value = useMemo<EvaluacionContextValue | null>(() => {
    if (!data) return null
    return {
      data,
      loading,
      error,
      sourceLabel,
      reloadFromFile,
      reloadFromServer,
    }
  }, [data, loading, error, sourceLabel, reloadFromFile, reloadFromServer])

  if (loading && !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy/20 border-t-navy" />
        <p className="mt-6 text-lg font-semibold text-navy">
          Cargando dashboard DANFOSS…
        </p>
        <p className="mt-2 max-w-md text-base text-black/55">
          Cargando datos del dashboard…
        </p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <ExcelErrorScreen
        error={error}
        onPickFile={reloadFromFile}
        onRetry={reloadFromServer}
      />
    )
  }

  if (!value) return null

  return (
    <EvaluacionContext.Provider value={value}>
      {children}
    </EvaluacionContext.Provider>
  )
}

function ExcelErrorScreen({
  error,
  onPickFile,
  onRetry,
}: {
  error: string
  onPickFile: (file: File) => Promise<void>
  onRetry: () => Promise<void>
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="max-w-lg rounded-2xl border border-dashed border-navy/30 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-navy">Falta el archivo Excel</h1>
        <p className="mt-3 text-base leading-relaxed text-black/55">{error}</p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-black/55">
          <li>
            Copia tu archivo a{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 text-navy">
              public/Evaluacion Danfoss.xlsx
            </code>
          </li>
          <li>
            Hojas: <strong>Compromisos</strong>, <strong>Bajas</strong>,{' '}
            <strong>Ausentismos</strong>, <strong>RESULTADOS</strong>
          </li>
          <li>Recarga la página o súbelo manualmente abajo</li>
        </ol>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-navy px-4 py-3 text-center text-sm font-bold text-white hover:bg-navy-light">
            Subir Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onPickFile(f)
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => void onRetry()}
            className="rounded-xl border border-navy/20 px-4 py-3 text-sm font-bold text-navy hover:bg-surface"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  )
}

export function useEvaluacion() {
  const ctx = useContext(EvaluacionContext)
  if (!ctx) {
    throw new Error('useEvaluacion debe usarse dentro de EvaluacionProvider')
  }
  return ctx
}
