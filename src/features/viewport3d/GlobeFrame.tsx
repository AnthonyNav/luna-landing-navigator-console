/**
 * Hueco del globo lunar (D-011, handoff docs/11 §3). Solo monta el iframe.
 * El puente postMessage (useGlobeBridge + globeProtocol.ts) es la fase 2: hasta entonces el globo
 * se muestra con sus sitios de demo y no recibe datos de la consola.
 */
import { GLOBE_URL } from '@/core/config'

export function GlobeFrame() {
  if (!GLOBE_URL) return null
  const src = new URL(GLOBE_URL)
  // El globo solo obedece a orígenes listados (README del globo): le pasamos el nuestro.
  src.searchParams.set('allowedOrigins', window.location.origin)
  return (
    <iframe
      title="Lunar globe"
      src={src.toString()}
      className="h-full w-full border-0"
      // Sin permisos extra: el globo solo necesita scripts y su propio origen para las teselas.
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
    />
  )
}
