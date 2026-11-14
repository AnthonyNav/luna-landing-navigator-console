import { useLayoutEffect, useRef, useState } from 'react'
import type { HorizonPoint, TimelinePoint } from '@/types'

/** Ancho real del contenedor: el SVG no se escala para no deformar los marcadores. */
function useWidth(fallback: number) {
  const ref = useRef<HTMLElement>(null)
  const [w, setW] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

/**
 * Silueta del horizonte local (horizon_profile, 0..359°) con la posición actual del Sol y la Tierra.
 * Todo viene del backend (D-002): aquí solo se dibuja.
 */
export function HorizonChart({ profile, point, height = 104 }: {
  profile: HorizonPoint[]; point?: TimelinePoint; height?: number
}) {
  const [ref, width] = useWidth(640)
  const els = profile.map((p) => p.horizon_el_deg)
  const lo = Math.min(-2, ...els, point?.earth_el_deg ?? 0, point?.sun_el_deg ?? 0) - 0.5
  const hi = Math.max(4, ...els, point?.earth_el_deg ?? 0, point?.sun_el_deg ?? 0) + 0.5
  const X = (az: number) => (az / 360) * width
  const Y = (el: number) => height - ((el - lo) / (hi - lo)) * height
  const line = profile.map((p, i) => `${i ? 'L' : 'M'}${X(p.az_deg).toFixed(1)} ${Y(p.horizon_el_deg).toFixed(1)}`).join(' ')
  const area = `M0 ${height} ${line.replace(/^M/, 'L')} L${width} ${height} Z`
  const body = (az: number, el: number, hz: number, color: string, label: string) => (
    <g aria-label={label}>
      <line x1={X(az)} x2={X(az)} y1={Y(el)} y2={Y(hz)} stroke={color} strokeWidth="1.5" />
      <circle cx={X(az)} cy={Y(el)} r="9" stroke={color} strokeOpacity="0.4" fill="none" />
      <circle cx={X(az)} cy={Y(el)} r="5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </g>
  )
  const ticks = [0, Math.ceil(lo), Math.floor(hi)].filter((v, i, a) => a.indexOf(v) === i)
  return (
    <figure ref={ref} className="flex w-full min-w-0 flex-col gap-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label="Local horizon profile with the current Sun and Earth positions" className="overflow-visible">
        <defs>
          <linearGradient id="hz-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a39a8b" stopOpacity="0.55" /><stop offset="1" stopColor="#5c5750" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {ticks.map((t) => <line key={t} x1="0" x2={width} y1={Y(t)} y2={Y(t)} stroke="#f4f1ea" strokeOpacity={t === 0 ? 0.25 : 0.08} strokeDasharray={t === 0 ? undefined : '2 4'} />)}
        {[90, 180, 270].map((a) => <line key={a} x1={X(a)} x2={X(a)} y1="0" y2={height} stroke="#f4f1ea" strokeOpacity="0.08" />)}
        <path d={area} fill="url(#hz-fill)" />
        <path d={line} stroke="#e6dfd3" strokeWidth="1.25" fill="none" />
        {point && body(point.sun_az_deg, point.sun_el_deg, point.sun_horizon_el_deg, '#ffc65c', 'Sun')}
        {point && body(point.earth_az_deg, point.earth_el_deg, point.earth_horizon_el_deg, '#5bbdff', 'Earth')}
      </svg>
      <figcaption className="tnum flex justify-between font-mono text-[11px] text-ink-3">
        {['0° N', '90° E', '180° S', '270° W', '360°'].map((t) => <span key={t}>{t}</span>)}
      </figcaption>
    </figure>
  )
}
