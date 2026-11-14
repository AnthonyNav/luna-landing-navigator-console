import { useMissionStore } from '@/core/store/useMissionStore'

export function SiteSelector() {
  const sites = useMissionStore((s) => s.sites)
  const selected = useMissionStore((s) => s.selected)
  const select = useMissionStore((s) => s.select)
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-400">
      Sitio de aterrizaje
      <select
        className="rounded border border-line bg-space p-2 text-sm text-gray-100"
        value={selected?.label ?? ''}
        onChange={(e) => {
          const s = sites.find((x) => x.name === e.target.value)
          if (s) select({ lat: s.lat, lon: s.lon, label: s.name })
        }}
      >
        <option value="" disabled>Selecciona…</option>
        {sites.map((s) => (
          <option key={s.id} value={s.name}>{s.name} · {s.category}</option>
        ))}
      </select>
    </label>
  )
}
