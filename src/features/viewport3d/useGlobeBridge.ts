import { useEffect, type RefObject } from 'react'
import { GLOBE_URL } from '@/core/config'
import { useMissionStore } from '@/core/store/useMissionStore'
import { useGlobeStore } from '@/core/store/useGlobeStore'
import { READY_TIMEOUT_MS, fromGlobe, landingMessage, psrItems, skyMessages, toGlobeSites } from './globeBridge'
import type { ToGlobe } from './globeProtocol'

/**
 * Puente con el globo (docs/11 §3). Único archivo que habla con el iframe.
 * - El iframe no se desmonta al simular (SceneBackground): normalmente hay un solo READY. Si el globo
 *   se recarga, cada READY reenvía el estado completo.
 * - La simulación ocurre en el globo: al evaluar vuela al sitio y la escena de alunizaje parte de esa vista.
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
    // Vuelo suave del globo hasta el sitio (SELECT_SITE vuela ~2,5 s; SET_VIEW salta sin animación)
    const flyToSelected = () => {
      const s = mission().selected
      if (s) post({ type: 'SELECT_SITE', payload: { id: s.id, lat: s.lat, lon: s.lon, label: s.label } })
    }
    const pushAll = () => {
      const m = mission()
      sendSites()
      sendSky()
      const psr = psrItems(m.psrs)
      if (psr.length) post({ type: 'SET_PSR', payload: psr })
      if (globe().landing.requested) startLanding()
      else flyToSelected()
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
      // Elegir un sitio o terminar una corrida recentra el globo en él (salvo durante la escena)
      const reran = s.evaluation !== p.evaluation && s.evaluation !== null
      if (((s.selected !== p.selected && s.selected) || reran) && !globe().landing.requested) flyToSelected()
    })
    const unsubGlobe = useGlobeStore.subscribe((s, p) => {
      if (!ready) return
      if (s.landing.requested && !p.landing.requested) startLanding()
      // Salir de la escena (o un error): el globo limpia módulo y polvo y vuelve a encuadrar el sitio
      if (!s.landing.requested && p.landing.requested) { post({ type: 'STOP_LANDING_SCENE' }); flyToSelected() }
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
