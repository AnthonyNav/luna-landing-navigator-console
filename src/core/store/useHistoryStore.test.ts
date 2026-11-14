import { expect, test } from 'vitest'
import { groupByDay, type HistoryRun } from './useHistoryStore'

const run = (id: string, savedAt: string) => ({ id, savedAt }) as HistoryRun
const now = new Date('2026-11-14T15:00:00Z')

test('agrupa por día UTC con Today y Yesterday', () => {
  const g = groupByDay([run('a', '2026-11-14T12:04:00Z'), run('b', '2026-11-14T09:00:00Z'), run('c', '2026-11-13T18:21:00Z'), run('d', '2026-11-10T08:47:00Z')], now)
  expect(g.map((x) => [x.label, x.runs.map((r) => r.id)])).toEqual([['Today', ['a', 'b']], ['Yesterday', ['c']], ['Nov 10', ['d']]])
})
