import { useMissionStore } from '@/core/store/useMissionStore'
import { API_BASE } from '@/core/api/client'

export function TopNavbar() {
  const health = useMissionStore((s) => s.health)
  const error = useMissionStore((s) => s.error)
  const ok = health?.status === 'ok'
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
      <span className="text-sm font-semibold tracking-widest">LUNAR NAVIGATOR</span>
      <span className="tnum text-xs text-gray-400" title={API_BASE}>
        API: <span className={ok ? 'text-go' : 'text-nogo'}>{ok ? 'OK' : error ? error.code : '...'}</span>
      </span>
    </header>
  )
}
