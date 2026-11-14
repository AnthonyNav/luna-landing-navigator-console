import { useMissionStore } from '@/core/store/useMissionStore'

export function TelemetryCards() {
  const s = useMissionStore((st) => st.evaluation?.summary)
  if (!s) return null
  const rows: [string, string, string][] = [
    ['Sol visible', `${s.sun_visible_pct}%`, 'text-sun'],
    ['Tierra visible (DTE)', `${s.earth_visible_pct}%`, 'text-earth'],
    ['Máx. sol continuo', `${s.max_continuous_sun_hours} h`, 'text-sun'],
    ['Máx. DTE continuo', `${s.max_continuous_dte_hours} h`, 'text-earth'],
    ['Potencia pico est.', `${s.estimated_peak_power_w} W`, 'text-gray-100'],
  ]
  return (
    <dl className="grid grid-cols-2 gap-2">
      {rows.map(([k, v, c]) => (
        <div key={k} className="rounded border border-line bg-space p-2">
          <dt className="text-[10px] text-gray-500">{k}</dt>
          <dd className={`tnum text-sm ${c}`}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
