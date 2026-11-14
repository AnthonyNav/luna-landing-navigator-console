// Contrato v1.1 (docs/06, D-010): backend en vivo y mock responden ErrorResponse
// { error: { code, message, details }, detail? }. Decidir SIEMPRE por `error.code`.
// El respaldo `{ detail }` solo queda para el backend oficial, que aún no cumple P-001
// (contexto-sesiones/iniciativas/lunar-landing-navigator/HANDOFF.md, pendiente 3).
export type ApiErrorCode =
  | 'ERR_INVALID_COORDINATES' | 'ERR_DATE_OUT_OF_RANGE' | 'ERR_TERRAIN_UNAVAILABLE'
  | 'ERR_UPSTREAM_SERVICE' | 'ERR_INVALID_PAYLOAD' | 'ERR_SCENARIO_LIMIT_EXCEEDED'
  | 'ERR_DUPLICATE_SCENARIOS' | 'ERR_NOT_FOUND' | 'ERR_NETWORK' | 'ERR_UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details?: unknown
  constructor(code: ApiErrorCode, status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

const KNOWN = new Set<string>([
  'ERR_INVALID_COORDINATES', 'ERR_DATE_OUT_OF_RANGE', 'ERR_TERRAIN_UNAVAILABLE',
  'ERR_UPSTREAM_SERVICE', 'ERR_INVALID_PAYLOAD', 'ERR_SCENARIO_LIMIT_EXCEEDED',
  'ERR_DUPLICATE_SCENARIOS', 'ERR_NOT_FOUND',
])

export function parseApiError(status: number, body: unknown): ApiError {
  const b = (body ?? {}) as { error?: { code?: string; message?: string; details?: unknown }; detail?: unknown }
  if (b.error?.code) {
    const code = KNOWN.has(b.error.code) ? (b.error.code as ApiErrorCode) : 'ERR_UNKNOWN'
    return new ApiError(code, status, b.error.message ?? code, b.error.details)
  }
  // Formato FastAPI: 422 -> payload inválido; 503 -> servicio externo.
  const msg = typeof b.detail === 'string' ? b.detail : JSON.stringify(b.detail ?? body ?? '')
  const code: ApiErrorCode = status === 503 ? 'ERR_UPSTREAM_SERVICE' : status === 422 || status === 400 ? 'ERR_INVALID_PAYLOAD' : 'ERR_UNKNOWN'
  return new ApiError(code, status, msg, b.detail)
}
