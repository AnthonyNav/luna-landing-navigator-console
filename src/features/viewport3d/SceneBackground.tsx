import { useMissionStore } from '@/core/store/useMissionStore'
import { LunarCanvas } from './LunarCanvas'
import { GLOBE_URL } from '@/core/config'
import { GlobeFrame } from './GlobeFrame'
import { GlobePlaceholder } from './GlobePlaceholder'

/**
 * Fondo de la consola: siempre a pantalla completa, detrás de los paneles (handoff docs/11 §2).
 * - El globo (D-011, VITE_GLOBE_URL) es el render principal y **nunca se desmonta**: así no se recarga
 *   ni corta la cámara al simular. La simulación y la escena de alunizaje ocurren en él.
 * - viewMode 'site' muestra encima la escena local del parche (`/terrain/patch`, "Terrain detail"),
 *   con un fundido; el globo queda oculto debajo. Sin globo, la escena local es el fondo al simular.
 */
export function SceneBackground() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const hasTerrain = useMissionStore((s) => s.terrain !== null)
  const showSite = viewMode === 'site' && hasTerrain
  return (
    <div className="fixed inset-0 z-0 bg-sky">
      <div className={`absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out)] ${showSite ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        aria-hidden={showSite || undefined}>
        {GLOBE_URL ? <GlobeFrame /> : <GlobePlaceholder />}
      </div>
      {showSite && <div className="fade-in absolute inset-0"><LunarCanvas /></div>}
    </div>
  )
}
