/**
 * Hueco del globo lunar (D-011, handoff docs/11 §3). Monta el iframe y lo conecta con el store por useGlobeBridge.
 * Si el globo no responde, la consola sigue con un fondo de reserva (docs/11 §5): nunca se bloquea.
 */
import { useRef } from 'react'
import { GLOBE_URL } from '@/core/config'
import { useGlobeStore } from '@/core/store/useGlobeStore'
import { GlobePlaceholder } from './GlobePlaceholder'
import { useGlobeBridge } from './useGlobeBridge'

export function GlobeFrame() {
  const frame = useRef<HTMLIFrameElement>(null)
  useGlobeBridge(frame)
  const link = useGlobeStore((s) => s.link)
  if (!GLOBE_URL) return null
  const src = new URL(GLOBE_URL)
  // El globo solo obedece a orígenes listados (README del globo): le pasamos el nuestro.
  src.searchParams.set('allowedOrigins', window.location.origin)
  return (
    <>
      {link === 'unavailable' && <GlobePlaceholder />}
      <iframe
        ref={frame}
        title="Lunar globe"
        src={src.toString()}
        className={link === 'unavailable' ? 'hidden' : 'h-full w-full border-0'}
        // Sin permisos extra: el globo solo necesita scripts y su propio origen para las teselas.
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
      />
    </>
  )
}
