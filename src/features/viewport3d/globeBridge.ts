// Funciones puras del puente con el globo (sin React, sin red): fáciles de probar.
import type { Evaluation, PsrNearby, Site } from '@/types'
import type { FromGlobe, GlobePsr, GlobeSite, ToGlobe, Vec3 } from './globeProtocol'

/** Si el globo no avisa READY en este tiempo se considera no disponible y la consola sigue con su escena local. */
export const READY_TIMEOUT_MS = 8000

const sameSpot = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
  Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lon - b.lon) < 1e-6

/** Sitios para los pines. El estado GO/CAUTION/NO-GO solo se conoce del sitio evaluado (es el que dio el backend). */
export function toGlobeSites(sites: Site[], evaluation: Evaluation | null): GlobeSite[] {
  return sites.map((s) => ({
    id: s.id, name: s.name, category: s.category, lat: s.lat, lon: s.lon,
    status: evaluation && sameSpot(evaluation.site, s) ? evaluation.site.status : undefined,
  }))
}

const isVec3 = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n))

/**
 * Sol y Tierra del paso actual del scrubber, tal cual los entrega el backend (D-002, D-006: el cliente no calcula física).
 * Vacío si no hay evaluación, el paso no existe o el vector no es válido: el globo no inventa un Sol.
 */
export function skyMessages(evaluation: Evaluation | null, stepIndex: number): ToGlobe[] {
  const tp = evaluation?.timeline[stepIndex]
  if (!evaluation || !tp) return []
  const { lat, lon } = evaluation.site
  const out: ToGlobe[] = []
  if (isVec3(tp.sun_vector_3d)) out.push({ type: 'SET_SUN_LOCAL', payload: { lat, lon, vector: tp.sun_vector_3d } })
  if (isVec3(tp.earth_vector_3d)) out.push({ type: 'SET_EARTH_LOCAL', payload: { lat, lon, vector: tp.earth_vector_3d } })
  return out
}

/** PSR de `GET /psr/nearby`, sin tocar. */
export const psrItems = (psrs: PsrNearby | null): GlobePsr[] =>
  (psrs?.psrs ?? []).map((p) => ({ gid: p.gid, name: p.name, geometry: p.geometry }))

/** Escena de alunizaje en el sitio evaluado. Solo lat/lon: el resto son decisiones de cámara con valores por defecto del globo. */
export function landingMessage(evaluation: Evaluation | null): ToGlobe | null {
  if (!evaluation) return null
  return { type: 'PLAY_LANDING_SCENE', payload: { lat: evaluation.site.lat, lon: evaluation.site.lon } }
}

/** Acepta solo mensajes del iframe del globo y de su origen exacto (docs/11 §3, seguridad). */
export function fromGlobe(e: { source: unknown; origin: string; data: unknown }, frameWindow: unknown, origin: string): FromGlobe | null {
  if (!frameWindow || e.source !== frameWindow || e.origin !== origin) return null
  const d = e.data as { type?: unknown } | null
  if (!d || typeof d !== 'object' || typeof d.type !== 'string') return null
  return d as FromGlobe
}
