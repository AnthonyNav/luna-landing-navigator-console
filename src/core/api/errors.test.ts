import { expect, test } from 'vitest'
import { parseApiError } from './errors'

test('decide por error.code del contrato', () => {
  const e = parseApiError(422, { error: { code: 'ERR_DATE_OUT_OF_RANGE', message: 'x' } })
  expect(e.code).toBe('ERR_DATE_OUT_OF_RANGE')
})
test('ErrorResponse del backend en vivo: manda error.code aunque venga detail', () => {
  const e = parseApiError(422, { error: { code: 'ERR_INVALID_COORDINATES', message: 'lat' }, detail: [{ loc: ['body', 'lat'] }] })
  expect(e.code).toBe('ERR_INVALID_COORDINATES')
  expect(parseApiError(404, { error: { code: 'ERR_NOT_FOUND', message: 'x' } }).code).toBe('ERR_NOT_FOUND')
})
test('formato FastAPI detail 422 -> ERR_INVALID_PAYLOAD', () => {
  expect(parseApiError(422, { detail: [] }).code).toBe('ERR_INVALID_PAYLOAD')
})
test('503 -> ERR_UPSTREAM_SERVICE', () => {
  expect(parseApiError(503, { detail: 'down' }).code).toBe('ERR_UPSTREAM_SERVICE')
})
