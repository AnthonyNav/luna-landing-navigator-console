/**
 * Mensajes con el globo lunar (D-011, handoff docs/11 §3).
 * FUENTE ÚNICA del protocolo: README.md del repo del globo (luna-render-nasa-space-challenge).
 * Aquí solo se declaran los mensajes que la consola usa; si el globo cambia uno, se cambia SOLO este archivo.
 */
import type { MissionStatus } from '@/types'

export interface GlobeSite { id: string; name: string; category?: string; lat: number; lon: number; status?: MissionStatus }
/** Un PSR tal como llega de GET /psr/nearby (geometría en metros estereográficos polares sur). */
export interface GlobePsr { gid: number; name?: string | null; geometry: { type: string; coordinates: unknown } }
export type ScenePhase = 'arrival' | 'descent' | 'landed' | 'done'
export type Vec3 = [number, number, number]
export interface SkyBody { az: number; el: number; horizonEl: number; visible: boolean }
export type HorizonPhase = 'arrival' | 'ready' | 'leaving'

export type ToGlobe =
  | { type: 'SET_SITES'; payload: GlobeSite[] }
  | { type: 'SELECT_SITE'; payload: { id?: string; lat: number; lon: number; label?: string } }
  /** `sun_vector_3d` / `earth_vector_3d` tal cual, en el marco local del sitio (D-008). Sin Sol enviado, el globo no lo dibuja. */
  | { type: 'SET_SUN_LOCAL'; payload: { lat: number; lon: number; vector: Vec3 } }
  | { type: 'SET_EARTH_LOCAL'; payload: { lat: number; lon: number; vector: Vec3 } }
  | { type: 'SET_PSR'; payload: GlobePsr[] }
  /** `horizon_profile` de `POST /evaluate`, tal cual. Va antes de SHOW_HORIZON. */
  | { type: 'SET_HORIZON'; payload: { lat: number; lon: number; profile: { az_deg: number; horizon_el_deg: number }[] } }
  /** Cielo del paso actual del scrubber (campos de `timeline[stepIndex]`). */
  | { type: 'SET_SKY_STATE'; payload: { sun: SkyBody; earth: SkyBody } }
  | { type: 'SET_HORIZON_DETAIL'; payload: { detailed: boolean } }
  /** Vista de horizonte (Lander POV, docs/05 §5.2): del globo al suelo del sitio. */
  | { type: 'SHOW_HORIZON'; payload: { lat: number; lon: number; headingDeg?: number } }
  | { type: 'EXIT_HORIZON' }
  /** `sample: true` rotula el globo: la luz y el horizonte no son reales (mock). */
  | { type: 'PLAY_LANDING_SCENE'; payload: { lat: number; lon: number; headingDeg?: number; startAltM?: number; durationS?: number; distanceM?: number; astronaut?: boolean } }
  | { type: 'STOP_LANDING_SCENE' }
  | { type: 'RESET' }

export type FromGlobe =
  | { type: 'READY' }
  | { type: 'SITE_CLICKED'; payload: GlobeSite }
  | { type: 'GLOBE_CLICKED'; payload: { lat: number; lon: number } }
  | { type: 'LOADING'; payload: { pending: number } }
  | { type: 'HORIZON_PHASE'; payload: { phase: HorizonPhase } }
  | { type: 'SCENE_PHASE'; payload: { phase: ScenePhase } }
  /** Curva ILUSTRATIVA de descenso (no es física): rotular siempre como tal. */
  | { type: 'SCENE_TELEMETRY'; payload: { t: number; altM: number; vMps: number } }
  | { type: 'SCENE_ERROR'; payload: { reason: string } }
