import { publicAssetPath } from '@/lib/basePath'
import { cn } from '@/lib/utils'

const LOGO_SRC = publicAssetPath('tactical-support-logo.png')

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  dark?: boolean
}

const sizes = {
  sm: { img: 'h-10 w-10', text: 'text-sm' },
  md: { img: 'h-14 w-14', text: 'text-base' },
  lg: { img: 'h-20 w-20', text: 'text-lg' },
  xl: { img: 'h-28 w-28 sm:h-36 sm:w-36', text: 'text-xl' },
}

export function Logo({
  size = 'md',
  showText = true,
  className,
  dark = false,
}: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={LOGO_SRC}
        alt="Tactical Support"
        className={cn(s.img, 'shrink-0 object-contain')}
      />
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              'font-bold uppercase leading-tight tracking-wide',
              s.text,
              dark ? 'text-white' : 'text-black',
            )}
          >
            Tactical Support
          </p>
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-widest',
              dark ? 'text-white/60' : 'text-black/55',
            )}
          >
            Est. 2009
          </p>
        </div>
      )}
    </div>
  )
}
