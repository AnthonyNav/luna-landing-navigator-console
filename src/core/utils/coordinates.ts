// Sistema local (contrato §1.2): +X Este, +Y arriba, -Z Norte. Los vectores del API ya vienen
// en este marco: se usan directo (D-008), sin conversiones trigonométricas.
import type { TimelinePoint } from '@/types'

export const SCENE_SCALE = 1 // metros de escena por metro real; ajustar en el visor
export const vec = (v: number[]): [number, number, number] => [v[0], v[1], v[2]]

/** Visibilidad O(1) con horizon_profile de 360 valores (D-002). */
export const isAboveHorizon = (elDeg: number, azDeg: number, horizon: { horizon_el_deg: number }[]): boolean =>
  elDeg > horizon[Math.round(azDeg) % 360].horizon_el_deg

export const pointAt = (timeline: TimelinePoint[], i: number): TimelinePoint | undefined => timeline[i]

/** "89.66° S  222.70° E" (longitud normalizada a 0..360 Este, convención del contrato). */
export const fmtCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}° ${lat < 0 ? 'S' : 'N'}  ${(((lon % 360) + 360) % 360).toFixed(2)}° E`
