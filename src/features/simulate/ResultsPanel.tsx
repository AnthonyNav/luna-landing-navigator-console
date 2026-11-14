import { Globe2, Mountain, Snowflake, Sun, Zap, type LucideIcon } from 'lucide-react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { deg, formatHours, hoursShort, pct } from '@/core/utils/timeline'
import { formatUtc } from '@/core/utils/time'
import { Divider, IconWell, Meter, Panel, SectionTitle, Skeleton, StatusChip, type Signal } from '@/ui'
import type { MissionStatus } from '@/types'

// Encabezado en lenguaje llano por estado. No repite umbrales: esos los decide el backend.
const HEADLINE: Record<MissionStatus, { title: string; body: string }> = {
  GO: { title: 'A good place to land', body: 'Enough sunlight, a line to Earth and safe ground for this window.' },
  CAUTION: { title: 'Possible, with risks', body: 'At least one condition is close to its limit. Check the details before committing.' },
  'NO-GO': { title: 'Not a safe choice', body: 'At least one condition fails for this window. Try another date or a nearby site.' },
}

function Countdown({ icon, signal, label, hours, until, none, note, share }: {
  icon: LucideIcon; signal: Signal; label: string; hours: number | null | undefined; until: string; none: string; note: string; share: number
}) {
  const f = formatHours(hours)
  return (
    <div className="flex items-start gap-3">
      <IconWell icon={icon} signal={signal} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-ink-3">{label}</span>
        {f ? <span className="flex items-baseline gap-1.5"><span className="tnum text-xl font-bold">{f.value}</span>
          <span className="text-[13px] font-medium text-ink-2">{[f.unit, until].filter(Boolean).join(' ')}</span></span>
          : <span className="text-xl font-bold">{none}</span>}
        <Meter value={share} signal={signal} label={`${label} share of the window`} />
        <span className="text-xs text-ink-2">{note}</span>
      </div>
    </div>
  )
}

function Fact({ icon, signal, label, value, unit, note }: { icon: LucideIcon; signal: Signal; label: string; value: string; unit: string; note: string }) {
  return (
    <div className="flex items-start gap-3">
      <IconWell icon={icon} signal={signal} />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-3">{label}</span>
        <span className="flex items-baseline gap-1.5"><span className="tnum text-xl font-bold">{value}</span><span className="text-[13px] font-medium text-ink-2">{unit}</span></span>
        <span className="text-xs text-ink-2">{note}</span>
      </div>
    </div>
  )
}

function Row({ k, a, b, ac, bc }: { k: string; a: string; b?: string; ac?: string; bc?: string }) {
  return (
    <div className="flex h-6 items-center text-xs">
      <span className="flex-1 text-ink-2">{k}</span>
      <span className={`tnum w-[78px] text-right font-mono text-[13px] font-medium ${ac ?? ''}`}>{a}</span>
      {b !== undefined && <span className={`tnum w-[78px] text-right font-mono text-[13px] font-medium ${bc ?? ''}`}>{b}</span>}
    </div>
  )
}

function Simple() {
  const ev = useMissionStore((s) => s.evaluation)!
  const point = useMissionStore((s) => s.evaluation?.timeline[s.stepIndex])
  const { summary: m, site } = ev
  const h = HEADLINE[site.status as MissionStatus] ?? HEADLINE.CAUTION
  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <StatusChip status={site.status} />
        <h3 className="text-[22px] leading-[27px] font-bold text-balance">{h.title}</h3>
        <p className="text-[13px] leading-[19px] text-ink-2">{h.body}</p>
      </div>
      <Divider />
      <Countdown icon={Sun} signal="sun" label="Daylight" hours={m.hours_to_next_sunset} until="until sunset" none="No sunset in this window"
        note={`Sunlit ${pct(m.sun_visible_pct, 0)} of the mission.`} share={m.sun_visible_pct / 100} />
      <Countdown icon={Globe2} signal="earth" label="Talk to Earth" hours={m.hours_to_next_earthset} until="until Earth sets" none="Earth stays in view"
        note={`Earth in view ${pct(m.earth_visible_pct, 0)} of the mission.`} share={m.earth_visible_pct / 100} />
      <Fact icon={Zap} signal="sun" label="Solar power now" value={point ? `${Math.round(point.power_factor * 100)}%` : '—'} unit="of panel output"
        note={`Peak in this window: ${(m.estimated_peak_power_w / 1000).toFixed(1)} kW.`} />
      <Fact icon={Mountain} signal="regolith" label="Ground" value={`${site.slope_deg.toFixed(1)}°`} unit="tilt"
        note={site.nearest_psr_km != null ? `Permanent shadow ${site.nearest_psr_km.toFixed(1)} km away.` : 'Local slope of the landing spot.'} />
    </>
  )
}

function Detailed() {
  const ev = useMissionStore((s) => s.evaluation)!
  const p = useMissionStore((s) => s.evaluation?.timeline[s.stepIndex])
  const stepIndex = useMissionStore((s) => s.stepIndex)
  const panelAreaM2 = useMissionStore((s) => s.panelAreaM2)
  const panelEfficiency = useMissionStore((s) => s.panelEfficiency)
  const { summary: m, site } = ev
  const clear = (el?: number, hz?: number) => (el == null || hz == null ? '—' : `${el - hz >= 0 ? '+' : ''}${(el - hz).toFixed(2)}°`)
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between"><StatusChip status={site.status} />
          <span className="text-xs text-ink-2">{site.reasons.length} checks from the backend</span></div>
        {/* reasons llegan en español desde el backend: pendiente en docs/ideas/console-ui-figma.md */}
        <ul className="flex flex-col gap-1.5">
          {site.reasons.map((r) => <li key={r} className="text-xs leading-[17px] text-ink" lang="es">{r}</li>)}
        </ul>
      </div>
      <Divider />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center text-[11px] font-medium text-ink-3">
          <span className="flex-1">Now, T+{stepIndex} steps</span>
          <span className="flex w-[78px] items-center justify-end gap-1.5 text-xs font-bold text-ink"><Sun size={13} className="text-sun" aria-hidden />Sun</span>
          <span className="flex w-[78px] items-center justify-end gap-1.5 text-xs font-bold text-ink"><Globe2 size={13} className="text-earth" aria-hidden />Earth</span>
        </div>
        <Row k="Status" a={p?.sun_visible ? 'Visible' : 'Hidden'} b={p?.earth_visible ? 'In view' : 'Hidden'}
          ac={p?.sun_visible ? 'text-sun' : 'text-nogo'} bc={p?.earth_visible ? 'text-earth' : 'text-nogo'} />
        <Row k="Azimuth" a={deg(p?.sun_az_deg)} b={deg(p?.earth_az_deg)} />
        <Row k="Elevation" a={deg(p?.sun_el_deg)} b={deg(p?.earth_el_deg)} />
        <Row k="Terrain horizon" a={deg(p?.sun_horizon_el_deg)} b={deg(p?.earth_horizon_el_deg)} />
        <Row k="Clearance" a={clear(p?.sun_el_deg, p?.sun_horizon_el_deg)} b={clear(p?.earth_el_deg, p?.earth_horizon_el_deg)} />
        <Row k="Visible in window" a={pct(m.sun_visible_pct)} b={pct(m.earth_visible_pct)} />
        <Row k="Longest stretch" a={hoursShort(m.max_continuous_sun_hours)} b={hoursShort(m.max_continuous_dte_hours)} />
        <Row k="Next set" a={hoursShort(m.hours_to_next_sunset)} b={hoursShort(m.hours_to_next_earthset)} />
        <p className="tnum pt-1 font-mono text-[11px] text-ink-3">
          Sunset {m.next_sunset_utc ? formatUtc(m.next_sunset_utc) : 'none in window'} · Earthset {m.next_earthset_utc ? formatUtc(m.next_earthset_utc) : 'none in window'}
        </p>
      </div>
      <Divider />
      <div className="flex flex-col gap-0.5">
        <SectionTitle aside={<span className="text-[11px] text-ink-3">{panelAreaM2.toFixed(1)} m² · {Math.round(panelEfficiency * 100)}%</span>}>
          <span className="flex items-center gap-2"><Zap size={14} className="text-sun" aria-hidden />Solar power</span></SectionTitle>
        <Row k="Power factor now" a={p ? p.power_factor.toFixed(2) : '—'} />
        <Row k="Average factor" a={m.avg_power_factor.toFixed(2)} />
        <Row k="Peak in window" a={`${Math.round(m.estimated_peak_power_w).toLocaleString('en-US')} W`} />
      </div>
      <Divider />
      <div className="flex flex-col gap-0.5">
        <SectionTitle><span className="flex items-center gap-2"><Mountain size={14} className="text-regolith" aria-hidden />Terrain & ice</span></SectionTitle>
        <Row k="Elevation" a={`${site.elevation_m.toLocaleString('en-US', { maximumFractionDigits: 1 })} m`} />
        <Row k="Local slope" a={`${site.slope_deg.toFixed(1)}°`} />
        <div className="flex h-6 items-center text-xs"><span className="flex flex-1 items-center gap-1.5 text-ink-2"><Snowflake size={12} className="text-psr" aria-hidden />Nearest shadow zone</span>
          <span className="tnum font-mono text-[13px] font-medium">{site.nearest_psr_km != null ? `${site.nearest_psr_km.toFixed(1)} km` : '—'}</span></div>
      </div>
    </>
  )
}

function Loading() {
  return (
    <div aria-busy className="flex flex-col gap-3.5">
      <span className="text-xs text-ink-2">Tracing the 360° horizon, then the Sun and Earth for every step…</span>
      <Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-56" /><Skeleton className="h-3 w-full" /><Divider />
      {[0, 1, 2].map((i) => <div key={i} className="flex gap-3"><Skeleton className="size-[30px] rounded-[9px]" />
        <div className="flex flex-1 flex-col gap-1.5"><Skeleton className="h-2.5 w-24" /><Skeleton className="h-4 w-36" /><Skeleton className="h-1 w-full" /></div></div>)}
    </div>
  )
}

export function ResultsPanel() {
  const detail = useMissionStore((s) => s.detail)
  const evaluation = useMissionStore((s) => s.evaluation)
  const loading = useMissionStore((s) => s.loading)
  const error = useMissionStore((s) => s.error)
  return (
    <Panel title="Results" label="Results">
      {loading ? <Loading />
        : error ? <ErrorNotice />
        : !evaluation ? <p className="text-[13px] leading-[19px] text-ink-2">Choose a landing site and a date, then run the simulation to see sunlight, the link to Earth and the ground.</p>
        : detail === 'detailed' ? <Detailed /> : <Simple />}
    </Panel>
  )
}

/** Decide por `code`, nunca por el mensaje (AGENTS.md del handoff). */
function ErrorNotice() {
  const error = useMissionStore((s) => s.error)!
  const text: Record<string, string> = {
    ERR_NETWORK: 'The simulation server is unreachable. Check the connection and try again.',
    ERR_UPSTREAM_SERVICE: 'The ephemeris service did not answer. Try again in a moment.',
    ERR_INVALID_COORDINATES: 'Those coordinates are outside the supported area.',
    ERR_INVALID_PAYLOAD: 'Some inputs are not valid. Review the setup and run again.',
    ERR_DATE_OUT_OF_RANGE: 'That date is outside the available ephemeris range.',
    ERR_TERRAIN_UNAVAILABLE: 'There is no terrain data for this spot. Try a nearby catalog site.',
  }
  return (
    <div role="alert" className="flex flex-col gap-1.5 rounded-xl bg-nogo/10 p-3 ring-1 ring-nogo/40">
      <span className="text-[13px] font-bold">Simulation failed</span>
      <span className="text-xs text-ink-2">{text[error.code] ?? 'Something went wrong. Try again.'}</span>
      <span className="tnum font-mono text-[11px] text-ink-3">{error.code}</span>
    </div>
  )
}
