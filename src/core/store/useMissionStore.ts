import { create } from 'zustand'
import { api } from '@/core/api/endpoints'
import { ApiError } from '@/core/api/errors'
import { toUtcIso } from '@/core/utils/time'
import type { Evaluation, HealthResponse, PsrNearby, Site, TerrainPatch } from '@/types'

// Tres velocidades (docs/ideas/frontend-architecture-guide.md §3):
// 1 configuración (barata) · 2 datos pesados vía API (bajo demanda) · 3 reproducción (cero red).
interface MissionState {
  health: HealthResponse | null
  sites: Site[]
  selected: { lat: number; lon: number; label: string } | null
  startUtc: string
  durationDays: number
  panelAreaM2: number
  panelEfficiency: number

  evaluation: Evaluation | null
  terrain: TerrainPatch | null
  psrs: PsrNearby | null
  loading: boolean
  error: ApiError | null

  stepIndex: number // capa 3: el scrubber solo cambia esto
  playing: boolean

  init: () => Promise<void>
  select: (s: { lat: number; lon: number; label: string }) => void
  setConfig: (p: Partial<Pick<MissionState, 'startUtc' | 'durationDays' | 'panelAreaM2' | 'panelEfficiency'>>) => void
  evaluate: () => Promise<void>
  setStep: (i: number) => void
  setPlaying: (p: boolean) => void
}

export const useMissionStore = create<MissionState>((set, get) => ({
  health: null, sites: [], selected: null,
  startUtc: toUtcIso(new Date('2026-12-01T00:00:00Z')), // valor de prueba de docs/07
  durationDays: 14, panelAreaM2: 4, panelEfficiency: 0.28,
  evaluation: null, terrain: null, psrs: null, loading: false, error: null,
  stepIndex: 0, playing: false,

  init: async () => {
    try {
      const [health, sites] = await Promise.all([api.health(), api.sites()])
      set({ health, sites: sites.sites, error: null })
    } catch (e) { set({ error: e as ApiError }) }
  },
  select: (selected) => set({ selected }),
  setConfig: (p) => set(p),
  evaluate: async () => {
    const { selected, startUtc, durationDays, panelAreaM2, panelEfficiency } = get()
    if (!selected) return
    set({ loading: true, error: null, stepIndex: 0, playing: false })
    try {
      const { lat, lon } = selected
      // Cambio de sitio: 3 llamadas en paralelo (solo cambio de fecha -> solo /evaluate; TODO optimizar)
      const [evaluation, terrain, psrs] = await Promise.all([
        api.evaluate({ lat, lon, start_utc: startUtc, duration_days: durationDays, step_minutes: 60,
          panel_efficiency: panelEfficiency, panel_area_m2: panelAreaM2 }),
        api.terrainPatch({ lat, lon, size_km: 12, resolution: 128 }),
        api.psrNearby({ lat, lon }),
      ])
      set({ evaluation, terrain, psrs, loading: false })
    } catch (e) { set({ error: e as ApiError, loading: false }) }
  },
  setStep: (stepIndex) => set({ stepIndex }),
  setPlaying: (playing) => set({ playing }),
}))
