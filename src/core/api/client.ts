import { ApiError, parseApiError } from './errors'

// La URL base SIEMPRE por entorno (el túnel de Cloudflare cambia). Ver docs/07 del handoff.
export const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch (e) {
    throw new ApiError('ERR_NETWORK', 0, e instanceof Error ? e.message : 'Network error')
  }
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) throw parseApiError(res.status, body)
  return body as T
}
