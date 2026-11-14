import { useMissionStore } from '@/core/store/useMissionStore'
import type { MissionStatus } from '@/types'

const COLOR: Record<MissionStatus, string> = { GO: 'text-go border-go', CAUTION: 'text-caution border-caution', 'NO-GO': 'text-nogo border-nogo' }

export function VerdictBanner() {
  const evaluation = useMissionStore((s) => s.evaluation)
  const error = useMissionStore((s) => s.error)
  // Se decide por error.code, nunca por el mensaje (AGENTS.md del handoff).
  if (error) return <div className="rounded border border-nogo p-3 text-xs text-nogo">{error.code}</div>
  if (!evaluation) return <div className="rounded border border-line p-3 text-xs text-gray-500">Sin evaluación todavía.</div>
  const { status, reasons } = evaluation.site
  const c = COLOR[status as MissionStatus] ?? 'border-line'
  return (
    <div className={`rounded border p-3 ${c}`}>
      <div className="text-lg font-bold">{status}</div>
      <ul className="mt-1 list-disc pl-4 text-xs text-gray-300">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  )
}
