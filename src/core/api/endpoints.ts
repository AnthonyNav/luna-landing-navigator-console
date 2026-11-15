import { apiFetch } from './client'
import type {
  CompareRequest, CompareResponse, EvaluateRequest, Evaluation, HealthResponse,
  Ephemeris, PsrList, PsrNearby, SitesResponse, TerrainPatch,
} from '@/types'

// Un método por endpoint de contracts/lunar-landing-api-contract.md que la consola usa (contrato v1.2, D-014).
// v1.2 agrega GET /ephemeris (cielo de la vista global) y GET /psr (PSR de todo el polo): ambos van al globo.
const qs = (p: Record<string, string | number | undefined>) =>
  new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()

export const api = {
  health: () => apiFetch<HealthResponse>('/health'),
  sites: () => apiFetch<SitesResponse>('/sites'),
  terrainPatch: (p: { lat: number; lon: number; size_km?: number; resolution?: 64 | 128 | 256 }) =>
    apiFetch<TerrainPatch>(`/terrain/patch?${qs(p)}`),
  evaluate: (body: EvaluateRequest) =>
    apiFetch<Evaluation>('/evaluate', { method: 'POST', body: JSON.stringify(body) }),
  compare: (body: CompareRequest) =>
    apiFetch<CompareResponse>('/compare', { method: 'POST', body: JSON.stringify(body) }),
  ephemeris: (utc: string) => apiFetch<Ephemeris>(`/ephemeris?${qs({ utc })}`),
  psrList: (p: { limit?: number; min_area_km2?: number; simplify_m?: number }) => apiFetch<PsrList>(`/psr?${qs(p)}`),
  psrNearby: (p: { lat: number; lon: number; radius_km?: number; limit?: number; simplify_m?: number }) =>
    apiFetch<PsrNearby>(`/psr/nearby?${qs(p)}`),
}
