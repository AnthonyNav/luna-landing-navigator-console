// Alias legibles sobre los tipos generados desde contracts/openapi.json.
// No edites api.d.ts a mano: `npm run gen:types`.
import type { components } from './api'

type S = components['schemas']
export type Site = S['LandingSite']
export type SitesResponse = S['SitesResponse']
export type HealthResponse = S['HealthResponse']
export type TerrainPatch = S['TerrainPatchResponse']
export type EvaluateRequest = S['EvaluateRequest']
export type Evaluation = S['EvaluateResponse']
export type TimelinePoint = S['TimelinePoint']
export type HorizonPoint = S['HorizonPoint']
export type CompareRequest = S['CompareRequest']
export type CompareResponse = S['CompareResponse']
export type PsrNearby = S['PsrNearbyResponse']
export type MissionStatus = 'GO' | 'CAUTION' | 'NO-GO' // contrato §2.4
