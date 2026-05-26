import { Logo } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        <Logo size="sm" />
        <p className="text-center text-xs text-zinc-500 sm:text-right">
          Dashboard de evaluación 360 · Uso interno · Tactical Support
          <br />
          <span className="text-zinc-400">
            Los datos mostrados corresponden al período indicado en el encabezado.
          </span>
        </p>
      </div>
    </footer>
  )
}
