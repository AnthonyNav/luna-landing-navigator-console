import { useEffect } from 'react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { TopNavbar } from '@/features/layout/TopNavbar'
import { SplitWorkspace } from '@/features/layout/SplitWorkspace'

export default function App() {
  const init = useMissionStore((s) => s.init)
  useEffect(() => { void init() }, [init])
  return (
    <div className="flex h-screen w-screen flex-col">
      <TopNavbar />
      <SplitWorkspace />
    </div>
  )
}
