import { Clapperboard, Globe2, LogOut } from 'lucide-react'
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

/** Controles discretos sobre el render: vista global, y la escena de alunizaje que dibuja el globo (docs/11 §6a). */
export function SceneControls() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const hasEvaluation = useMissionStore((s) => s.evaluation !== null)
  const backToGlobe = useMissionStore((s) => s.backToGlobe)
  const showSite = useMissionStore((s) => s.showSite)
  const landing = useGlobeStore((s) => s.landing)
  const link = useGlobeStore((s) => s.link)
  const requestLanding = useGlobeStore((s) => s.requestLanding)
  const clearLanding = useGlobeStore((s) => s.clearLanding)

  const exitScene = () => { clearLanding(); showSite() }

  // Escena en curso (el globo es el fondo)
  if (viewMode === 'globe' && landing.requested) {
    const telemetry = landing.phase === 'descent' && landing.altM !== null && landing.vMps !== null
    return (
      <>
        <Pill aria-live="polite" className="pointer-events-none">
          <Clapperboard size={14} aria-hidden />
          {link === 'unavailable' ? 'The globe is not available' : landing.phase ? PHASE_TEXT[landing.phase] : 'Starting…'}
          {telemetry && <span className="tnum font-mono"> · {Math.round(landing.altM!)} m · {landing.vMps!.toFixed(1)} m/s (illustrative)</span>}
        </Pill>
        <Pill onClick={exitScene} aria-label="Exit the landing scene"><LogOut size={14} aria-hidden />Exit scene</Pill>
      </>
    )
  }

  if (viewMode !== 'site') {
    // En vista global con un error de la escena o sin evaluación, solo se informa
    return landing.error ? <Pill className="pointer-events-none" aria-live="polite">{landing.error}</Pill> : null
  }
  return (
    <>
      <Pill onClick={backToGlobe} aria-label="Back to the global view">
        <Globe2 size={14} aria-hidden />Global view
      </Pill>
      {GLOBE_URL && hasEvaluation && (
        <Pill onClick={() => { requestLanding(); backToGlobe() }} aria-label="Watch an illustrative landing at this site">
          <Clapperboard size={14} aria-hidden />Landing scene
        </Pill>
      )}
    </>
  )
}
