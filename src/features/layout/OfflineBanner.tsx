import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useMissionStore } from '@/core/store/useMissionStore'

const RETRY_S = 20

/** Backend inalcanzable al arrancar: dice qué falta y reintenta solo (Figma C6). Decide por `code`. */
export function OfflineBanner() {
  const health = useMissionStore((s) => s.health)
  const error = useMissionStore((s) => s.error)
  const init = useMissionStore((s) => s.init)
  const offline = !health && error?.code === 'ERR_NETWORK'
  const [left, setLeft] = useState(RETRY_S)
  useEffect(() => {
    if (!offline) return
    setLeft(RETRY_S)
    const id = setInterval(() => setLeft((s) => {
      if (s <= 1) { void init(); return RETRY_S }
      return s - 1
    }), 1000)
    return () => clearInterval(id)
  }, [offline, init])
  if (!offline) return null
  return (
    <div role="alert" className="glass pointer-events-auto flex max-w-[420px] items-start gap-3 rounded-2xl p-3.5 ring-1 ring-caution/40"
      style={{ ['--glass-fill' as string]: 'rgb(42 29 16 / 0.7)' }}>
      <WifiOff size={16} className="mt-0.5 shrink-0 text-caution" aria-hidden />
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold">Simulation server unreachable</span>
        <span className="text-xs text-ink-2">Sites and simulations are paused until the connection returns.</span>
        <span className="flex gap-3.5 text-xs"><button onClick={() => void init()} className="font-bold">Retry now</button>
          <span className="tnum text-ink-3">Retrying in {left} s</span></span>
      </div>
    </div>
  )
}
