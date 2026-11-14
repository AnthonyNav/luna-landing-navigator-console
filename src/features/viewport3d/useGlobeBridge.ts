import { useEffect, type RefObject } from 'react'
import { GLOBE_URL } from '@/core/config'
import { useMissionStore } from '@/core/store/useMissionStore'
import { useGlobeStore } from '@/core/store/useGlobeStore'
import { READY_TIMEOUT_MS, fromGlobe, landingMessage, psrItems, skyMessages, toGlobeSites } from './globeBridge'
import type { ToGlobe } from './globeProtocol'

/**
 * Puente con el globo (docs/11 §3). Único archivo que habla con el iframe.
 * - El globo se desmonta al pasar a la escena local: cada READY reenvía el estado completo.
 * - Sol y Tierra siguen al scrubber (cero red, D-003), agrupados por fotograma.
 * - Si el globo no responde READY en 8 s, la consola sigue sin él (`link: 'unavailable'`).
 */
export function useGlobeBridge(frame: RefObject<HTMLIFrameElement | null>) {
  useEffect(() => {
    if (!GLOBE_URL) return
    const origin = new URL(GLOBE_URL).origin
    const globe = useGlobeStore.getState
    const mission = useMissionStore.getState
    let ready = false
    let raf = 0

    globe().setLink('loading')
    const timeout = window.setTimeout(() => { if (!ready) globe().setLink('unavailable') }, READY_TIMEOUT_MS)

    const post = (m: ToGlobe) => frame.current?.contentWindow?.postMessage(m, origin)
    const sendSky = () => skyMessages(mission().evaluation, mission().stepIndex).forEach(post)
    const sendSites = () => post({ type: 'SET_SITES', payload: toGlobeSites(mission().sites, mission().evaluation) })
    const startLanding = () => {
      const play = landingMessage(mission().evaluation)
      if (!play) return globe().setLandingError('Run a simulation first.')
      sendSky() // el Sol y la Tierra reales del paso actual deben llegar antes que la escena
      post(play)
    }
    const pushAll = () => {
      const m = mission()
      sendSites()
      sendSky()
      const psr = psrItems(m.psrs)
      if (psr.length) post({ type: 'SET_PSR', payload: psr })
      if (globe().landing.requested) startLanding()
      else if (m.selected) post({ type: 'SELECT_SITE', payload: { id: m.selected.id, lat: m.selected.lat, lon: m.selected.lon, label: m.selected.label } })
    }

    const onMessage = (e: MessageEvent) => {
      const msg = fromGlobe(e, frame.current?.contentWindow, origin)
      if (!msg) return
      switch (msg.type) {
        case 'READY':
          ready = true
          window.clearTimeout(timeout)
          globe().setLink('ready')
          pushAll()
          break
        case 'SITE_CLICKED': // igual que elegir en el selector: solo selecciona, evaluar es decisión del usuario
          if (!globe().landing.requested) mission().select({ id: msg.payload.id, lat: msg.payload.lat, lon: msg.payload.lon, label: msg.payload.name, category: msg.payload.category })
          break
        case 'GLOBE_CLICKED':
          if (!globe().landing.requested) mission().select({ lat: msg.payload.lat, lon: msg.payload.lon, label: 'Custom pin' })
          break
        case 'SCENE_PHASE': globe().setPhase(msg.payload.phase); break
        case 'SCENE_TELEMETRY': globe().setTelemetry(msg.payload.altM, msg.payload.vMps); break
        case 'SCENE_ERROR': globe().setLandingError(msg.payload.reason); break
        default: break
      }
    }
    window.addEventListener('message', onMessage)

    const unsubMission = useMissionStore.subscribe((s, p) => {
      if (!ready) return
      if (s.sites !== p.sites || s.evaluation !== p.evaluation) sendSites()
      if (s.evaluation !== p.evaluation || s.stepIndex !== p.stepIndex) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(sendSky)
      }
      if (s.psrs !== p.psrs) post({ type: 'SET_PSR', payload: psrItems(s.psrs) })
      if (s.selected !== p.selected && s.selected && !globe().landing.requested) {
        post({ type: 'SELECT_SITE', payload: { id: s.selected.id, lat: s.selected.lat, lon: s.selected.lon, label: s.selected.label } })
      }
    })
    const unsubGlobe = useGlobeStore.subscribe((s, p) => {
      if (ready && s.landing.requested && !p.landing.requested) startLanding()
    })

    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(raf)
      window.removeEventListener('message', onMessage)
      unsubMission()
      unsubGlobe()
      globe().setLink('idle')
    }
  }, [frame])
}
