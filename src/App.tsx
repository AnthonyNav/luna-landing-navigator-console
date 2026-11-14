import { useEffect } from 'react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { ConsoleShell, type WorkspaceSlots } from '@/features/layout/ConsoleShell'
import { Sidebar } from '@/features/sidebar/Sidebar'
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber'
import { Panel } from '@/ui'

function useSlots(): WorkspaceSlots {
  // Cada workspace decide qué va en cada hueco del cascarón.
  return {
    left: <Panel title="Setup"><Sidebar /></Panel>,
    bottom: <Panel className="w-full max-w-[688px]"><TimelineScrubber /></Panel>,
  }
}

export default function App() {
  const init = useMissionStore((s) => s.init)
  useEffect(() => { void init() }, [init])
  return <ConsoleShell slots={useSlots()} />
}
