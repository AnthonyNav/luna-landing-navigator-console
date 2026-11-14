import { Clapperboard, Globe2, LogOut, Mountain } from 'lucide-react'
import { GLOBE_URL } from '@/core/config'
import { useMissionStore } from '@/core/store/useMissionStore'
import { useGlobeStore } from '@/core/store/useGlobeStore'
import type { ScenePhase } from '@/features/viewport3d/globeProtocol'
import { Pill } from '@/ui'

const PHASE_TEXT: Record<ScenePhase, string> = {
  arrival: 'Flying to the site…',
  descent: 'Illustrative descent',
  landed: 'Touchdown',
  done: 'Drag to look around',
}

/**
 * Controles discretos sobre el render (docs/11 §6a). La simulación vive en el globo: la escena de
 * alunizaje parte de la vista actual sin cambiar de motor. "Terrain detail" abre la escena local del
 * parche de `/terrain/patch` encima del globo, sin desmontarlo.
 */
export function SceneControls() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const hasEvaluation = useMissionStore((s) => s.evaluation !== null)
  const hasTerrain = useMissionStore((s) => s.terrain !== null)
  const backToGlobe = useMissionStore((s) => s.backToGlobe)
  const showSite = useMissionStore((s) => s.showSite)
  const landing = useGlobeStore((s) => s.landing)
  const link = useGlobeStore((s) => s.link)
  const requestLanding = useGlobeStore((s) => s.requestLanding)
  const clearLanding = useGlobeStore((s) => s.clearLanding)
  const globeReady = !!GLOBE_URL && link === 'ready'

  // Escena de alunizaje en curso (en el globo)
  if (viewMode === 'globe' && landing.requested) {
    const telemetry = landing.phase === 'descent' && landing.altM !== null && landing.vMps !== null
    return (
      <>
        <Pill aria-live="polite" className="pointer-events-none">
          <Clapperboard size={14} aria-hidden />
          {link === 'unavailable' ? 'The globe is not available' : landing.phase ? PHASE_TEXT[landing.phase] : 'Starting…'}
          {/* La curva de descenso no es física: lo dice el rótulo de la fase */}
          {telemetry && <span className="tnum font-mono">· {Math.round(landing.altM!)} m · {landing.vMps!.toFixed(1)} m/s</span>}
        </Pill>
        <Pill onClick={clearLanding} aria-label="Exit the landing scene"><LogOut size={14} aria-hidden />Exit scene</Pill>
      </>
    )
  }

  // Escena local del parche encima del globo
  if (viewMode === 'site') {
    return (
      <Pill onClick={backToGlobe} aria-label="Back to the globe">
        <Globe2 size={14} aria-hidden />{GLOBE_URL ? 'Back to globe' : 'Global view'}
      </Pill>
    )
  }

  if (!hasEvaluation) return landing.error ? <Pill className="pointer-events-none" aria-live="polite">{landing.error}</Pill> : null
  return (
    <>
      {globeReady && (
        <Pill onClick={requestLanding} aria-label="Watch an illustrative landing at this site">
          <Clapperboard size={14} aria-hidden />Landing scene
        </Pill>
      )}
      {hasTerrain && (
        <Pill onClick={showSite} aria-label="Open the local terrain from the API">
          <Mountain size={14} aria-hidden />Terrain detail
        </Pill>
      )}
      {landing.error && <Pill className="pointer-events-none" aria-live="polite">{landing.error}</Pill>}
    </>
  )
}
