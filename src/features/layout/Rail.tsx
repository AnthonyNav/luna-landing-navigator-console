import { useMissionStore } from '@/core/store/useMissionStore'
import { WORKSPACES } from './workspaces'

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="10" stroke="#F4F1EA" strokeOpacity="0.55" />
      <path d="M1.5 13.5 C5 11 8 10.2 11 11.2 C14 12.2 17 11.8 20.5 9.5" stroke="#FFC65C" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="11" cy="11.2" r="1.8" fill="#F4F1EA" />
    </svg>
  )
}

export function Rail() {
  const workspace = useMissionStore((s) => s.workspace)
  const setWorkspace = useMissionStore((s) => s.setWorkspace)
  return (
    <nav aria-label="Workspaces" className="glass pointer-events-auto flex w-[72px] flex-col items-center gap-1.5 rounded-[22px] py-3.5">
      <span className="mb-3.5" title="Lunar Navigator"><Logo /></span>
      {WORKSPACES.map(({ id, label, icon: Icon }) => {
        const on = id === workspace
        return (
          <button key={id} onClick={() => setWorkspace(id)} aria-current={on ? 'page' : undefined}
            className={`flex w-[60px] flex-col items-center gap-1 rounded-[14px] py-2 text-[11px] transition-colors ${on ? 'raised font-bold text-ink' : 'font-medium text-ink-2 hover:text-ink'}`}>
            <Icon size={19} aria-hidden />{label}
          </button>
        )
      })}
    </nav>
  )
}
