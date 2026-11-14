import { useMissionStore } from '@/core/store/useMissionStore'
import { toUtcIso } from '@/core/utils/time'

const DURATIONS = [7, 14, 29.5]

export function DateConfigurator() {
  const { startUtc, durationDays, selected, loading, setConfig, evaluate } = useMissionStore()
  return (
    <div className="flex flex-col gap-3 text-xs text-gray-400">
      <label className="flex flex-col gap-1">
        Inicio (UTC)
        <input
          type="datetime-local"
          className="tnum rounded border border-line bg-space p-2 text-sm text-gray-100"
          value={startUtc.slice(0, 16)}
          onChange={(e) => e.target.value && setConfig({ startUtc: toUtcIso(new Date(`${e.target.value}:00Z`)) })}
        />
      </label>
      <div className="flex gap-2">
        {DURATIONS.map((d) => (
          <button key={d} onClick={() => setConfig({ durationDays: d })}
            className={`rounded border px-2 py-1 ${d === durationDays ? 'border-earth text-earth' : 'border-line'}`}>
            {d} d
          </button>
        ))}
      </div>
      <button disabled={!selected || loading} onClick={() => void evaluate()}
        className="rounded bg-earth/90 p-2 text-sm font-semibold text-space disabled:opacity-40">
        {loading ? 'Evaluando…' : 'Evaluar misión'}
      </button>
    </div>
  )
}
