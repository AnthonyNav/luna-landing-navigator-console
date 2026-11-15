import { expect, test } from 'vitest'
import { formatUtc, toUtcIso } from './time'

test('toUtcIso quita milisegundos', () => {
  expect(toUtcIso(new Date('2026-12-01T00:00:00.000Z'))).toBe('2026-12-01T00:00:00Z')
})
test('formatUtc', () => {
  expect(formatUtc('2026-12-04T14:00:00Z')).toBe('2026-12-04 14:00 UTC')
  // timestamp_utc puede traer milisegundos
  expect(formatUtc('2026-12-01T00:00:00.000Z')).toBe('2026-12-01 00:00 UTC')
})
