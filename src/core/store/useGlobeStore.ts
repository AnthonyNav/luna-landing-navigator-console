import { create } from 'zustand'
import type { ScenePhase } from '@/features/viewport3d/globeProtocol'

/** Estado del enlace con el globo y de la escena de alunizaje. Aparte del store de misión: lo escribe solo el puente. */
export type GlobeLink = 'idle' | 'loading' | 'ready' | 'unavailable'
export interface Landing { requested: boolean; phase: ScenePhase | null; altM: number | null; vMps: number | null; error: string | null }

const NONE: Landing = { requested: false, phase: null, altM: null, vMps: null, error: null }

interface GlobeState {
  link: GlobeLink
  landing: Landing
  setLink: (l: GlobeLink) => void
  requestLanding: () => void
  clearLanding: () => void
  setPhase: (p: ScenePhase) => void
  setTelemetry: (altM: number, vMps: number) => void
  setLandingError: (reason: string) => void
}

export const useGlobeStore = create<GlobeState>((set) => ({
  link: 'idle',
  landing: NONE,
  setLink: (link) => set({ link }),
  requestLanding: () => set({ landing: { ...NONE, requested: true } }),
  clearLanding: () => set({ landing: NONE }),
  setPhase: (phase) => set((s) => ({ landing: { ...s.landing, phase } })),
  setTelemetry: (altM, vMps) => set((s) => ({ landing: { ...s.landing, altM, vMps } })),
  setLandingError: (error) => set((s) => ({ landing: { ...s.landing, error, requested: false } })),
}))
