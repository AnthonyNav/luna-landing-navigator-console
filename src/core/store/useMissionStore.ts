import { create } from 'zustand'
import { GLOBE_URL } from '@/core/config'
import { useGlobeStore } from './useGlobeStore'
import { api } from '@/core/api/endpoints'
import { ApiError } from '@/core/api/errors'
import { toUtcIso } from '@/core/utils/time'
import type { CompareResponse, Evaluation, HealthResponse, PsrNearby, Site, TerrainPatch } from '@/types'

export type Workspace = 'simulate' | 'compare' | 'history' | 'missions'
export type DetailLevel = 'simple' | 'detailed'
/** Qué render es el fondo (handoff docs/11 §2, P-006): globo sin sitio evaluado, escena local tras evaluar. */
export type ViewMode = 'globe' | 'site'

export interface SelectedSite { id?: string; lat: number; lon: number; label: string; category?: string }
export interface Scenario { key: string; label: string; site: SelectedSite; startUtc: string }

export const MAX_SCENARIOS = 5 // contrato §2.5: 2 a 5 escenarios
export const STEP_OPTIONS = [15, 60, 120] as const

// Tres velocidades (docs/ideas/frontend-architecture-guide.md §3):
// 1 configuración (barata) · 2 datos pesados vía API (bajo demanda) · 3 reproducción (cero red).
interface MissionState {
  // shell
  workspace: Workspace
  detail: DetailLevel
  fullscreen: boolean
  viewMode: ViewMode

  // capa 1: configuración
  health: HealthResponse | null
  sites: Site[]
  selected: SelectedSite | null
  startUtc: string
  durationDays: number
  stepMinutes: number
  panelAreaM2: number
  panelEfficiency: number

  // capa 2: datos de la API
  evaluation: Evaluation | null
  terrain: TerrainPatch | null
  psrs: PsrNearby | null
  loading: boolean
  error: ApiError | null
  lastRunMs: number | null

  // capa 3: reproducción
  stepIndex: number
  playing: boolean

  // compare
  scenarios: Scenario[]
  comparison: CompareResponse | null
  comparing: boolean
  compareError: ApiError | null
  shownScenario: string | null

  // selección dentro de History y Missions
  pickedRun: string | null
  pickedMission: string

  init: () => Promise<void>
  setWorkspace: (w: Workspace) => void
  setDetail: (d: DetailLevel) => void
  toggleFullscreen: () => void
  select: (s: SelectedSite) => void
  setConfig: (p: Partial<Pick<MissionState, 'startUtc' | 'durationDays' | 'stepMinutes' | 'panelAreaM2' | 'panelEfficiency'>>) => void
  evaluate: () => Promise<void>
  backToGlobe: () => void
  /** Vuelve a la escena local del sitio ya evaluado (sin pedir nada a la API). */
  showSite: () => void
  setStep: (i: number) => void
  setPlaying: (p: boolean) => void

  addScenario: (s: Omit<Scenario, 'key'>) => boolean
  removeScenario: (key: string) => void
  compare: () => Promise<void>
  showScenario: (key: string) => Promise<void>
  pickRun: (id: string | null) => void
  pickMission: (id: string) => void
}

let scenarioSeq = 0
const sameScenario = (a: Omit<Scenario, 'key'>, b: Omit<Scenario, 'key'>) =>
  a.site.lat === b.site.lat && a.site.lon === b.site.lon && a.startUtc === b.startUtc

export const useMissionStore = create<MissionState>((set, get) => ({
  workspace: 'simulate', detail: 'simple', fullscreen: false, viewMode: 'globe',
  health: null, sites: [], selected: null,
  startUtc: toUtcIso(new Date('2026-12-01T00:00:00Z')), // valor de prueba de docs/07
  durationDays: 14, stepMinutes: 60, panelAreaM2: 4, panelEfficiency: 0.28,
  evaluation: null, terrain: null, psrs: null, loading: false, error: null, lastRunMs: null,
  stepIndex: 0, playing: false,
  scenarios: [], comparison: null, comparing: false, compareError: null, shownScenario: null,
  pickedRun: null, pickedMission: 'im-1',

  init: async () => {
    try {
      const [health, sites] = await Promise.all([api.health(), api.sites()])
      set({ health, sites: sites.sites, error: null })
    } catch (e) { set({ error: e as ApiError }) }
  },
  setWorkspace: (workspace) => set({ workspace }),
  setDetail: (detail) => set({ detail }),
  toggleFullscreen: () => set((s) => ({ fullscreen: !s.fullscreen })),
  select: (selected) => set({ selected, error: null }),
  setConfig: (p) => set(p),

  evaluate: async () => {
    const { selected, startUtc, durationDays, stepMinutes, panelAreaM2, panelEfficiency } = get()
    if (!selected) return
    set({ loading: true, error: null, stepIndex: 0, playing: false })
    const t0 = performance.now()
    try {
      const { lat, lon } = selected
      // Cambio de sitio: 3 llamadas en paralelo (solo cambio de fecha -> solo /evaluate; TODO optimizar)
      const [evaluation, terrain, psrs] = await Promise.all([
        api.evaluate({ lat, lon, start_utc: startUtc, duration_days: durationDays, step_minutes: stepMinutes,
          panel_efficiency: panelEfficiency, panel_area_m2: panelAreaM2 }),
        api.terrainPatch({ lat, lon, size_km: 12, resolution: 128 }),
        api.psrNearby({ lat, lon }),
      ])
      // Con el globo disponible la simulación se queda en él (vuelo continuo, sin cambio de motor);
      // la escena local del parche queda como "Terrain detail". Sin globo, la escena local es el fondo.
      const globeOk = !!GLOBE_URL && useGlobeStore.getState().link !== 'unavailable'
      set({ evaluation, terrain, psrs, loading: false, viewMode: globeOk ? 'globe' : 'site', lastRunMs: performance.now() - t0 })
    } catch (e) { set({ error: e as ApiError, loading: false }) }
  },
  backToGlobe: () => set({ viewMode: 'globe', playing: false }),
  showSite: () => set((s) => (s.terrain ? { viewMode: 'site' } : {})),
  setStep: (stepIndex) => set({ stepIndex }),
  setPlaying: (playing) => set({ playing }),

  addScenario: (s) => {
    const { scenarios } = get()
    if (scenarios.length >= MAX_SCENARIOS || scenarios.some((x) => sameScenario(x, s))) return false
    set({ scenarios: [...scenarios, { ...s, key: `s${++scenarioSeq}` }], comparison: null })
    return true
  },
  removeScenario: (key) => set((st) => ({
    scenarios: st.scenarios.filter((x) => x.key !== key), comparison: null,
    shownScenario: st.shownScenario === key ? null : st.shownScenario,
  })),
  compare: async () => {
    const { scenarios, durationDays, panelAreaM2, panelEfficiency } = get()
    if (scenarios.length < 2) return
    set({ comparing: true, compareError: null })
    try {
      const comparison = await api.compare({
        scenarios: scenarios.map((s) => ({ label: s.label, lat: s.site.lat, lon: s.site.lon, start_utc: s.startUtc })),
        duration_days: durationDays, step_minutes: 120, panel_efficiency: panelEfficiency, panel_area_m2: panelAreaM2,
      })
      set({ comparison, comparing: false })
    } catch (e) { set({ compareError: e as ApiError, comparing: false }) }
  },
  // Mostrar un escenario en el terreno = evaluarlo como la simulación activa.
  showScenario: async (key) => {
    const sc = get().scenarios.find((x) => x.key === key)
    if (!sc) return
    set({ shownScenario: key, selected: sc.site, startUtc: sc.startUtc })
    await get().evaluate()
  },
  pickRun: (pickedRun) => set({ pickedRun }),
  pickMission: (pickedMission) => set({ pickedMission }),
}))
