import { useEffect } from 'react'
import { useMissionStore, type Workspace } from '@/core/store/useMissionStore'
import { ConsoleShell, type WorkspaceSlots } from '@/features/layout/ConsoleShell'
import { SetupPanel } from '@/features/simulate/SetupPanel'
import { ResultsPanel } from '@/features/simulate/ResultsPanel'
import { SceneControls } from '@/features/simulate/SceneControls'
import { TimelineDock } from '@/features/timeline/TimelineDock'
import { CompareMatrix, ScenariosPanel } from '@/features/comparator/ComparePanels'

// Cada workspace decide qué va en cada hueco del cascarón.
const SLOTS: Record<Workspace, () => WorkspaceSlots> = {
  simulate: () => ({ left: <SetupPanel />, right: <ResultsPanel />, top: <SceneControls />, bottom: <TimelineDock /> }),
  compare: () => ({ left: <ScenariosPanel />, top: <SceneControls />, bottom: <TimelineDock />, overlay: <CompareMatrix /> }),
  history: () => ({}),
  missions: () => ({}),
}

export default function App() {
  const init = useMissionStore((s) => s.init)
  const workspace = useMissionStore((s) => s.workspace)
  useEffect(() => { void init() }, [init])
  return <ConsoleShell slots={SLOTS[workspace]()} />
}
