import { useMissionStore } from '@/core/store/useMissionStore'
import { LunarCanvas } from './LunarCanvas'
import { GLOBE_URL } from '@/core/config'
import { GlobeFrame } from './GlobeFrame'
import { GlobePlaceholder } from './GlobePlaceholder'

/**
 * Fondo de la consola: siempre a pantalla completa, detrás de los paneles (handoff docs/11 §2).
 * Un solo render visible a la vez: el que no se ve se desmonta, así nunca hay dos contextos WebGL.
 * - viewMode 'globe': globo de D-011 por iframe (VITE_GLOBE_URL) o un placeholder si no hay URL.
 * - viewMode 'site': escena local del sitio (terrain/patch) en Three.js, dueña la consola.
 */
export function SceneBackground() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const hasTerrain = useMissionStore((s) => s.terrain !== null)
  const showSite = viewMode === 'site' && hasTerrain
  return (
    <div className="fixed inset-0 z-0">
      {showSite ? <LunarCanvas /> : GLOBE_URL ? <GlobeFrame /> : <GlobePlaceholder />}
    </div>
  )
}
