import { expect, test } from 'vitest'
import { parseApiError } from './errors'

test('decide por error.code del contrato', () => {
  const e = parseApiError(422, { error: { code: 'ERR_DATE_OUT_OF_RANGE', message: 'x' } })
  expect(e.code).toBe('ERR_DATE_OUT_OF_RANGE')
})
test('formato FastAPI detail 422 -> ERR_INVALID_PAYLOAD', () => {
  expect(parseApiError(422, { detail: [] }).code).toBe('ERR_INVALID_PAYLOAD')
})
test('503 -> ERR_UPSTREAM_SERVICE', () => {
  expect(parseApiError(503, { detail: 'down' }).code).toBe('ERR_UPSTREAM_SERVICE')
})
