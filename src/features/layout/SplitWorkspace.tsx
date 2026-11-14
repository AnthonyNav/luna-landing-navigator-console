import { Sidebar } from '@/features/sidebar/Sidebar'
import { LunarCanvas } from '@/features/viewport3d/LunarCanvas'
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber'

export function SplitWorkspace() {
  return (
    <main className="flex min-h-0 flex-1">
      <aside className="w-[30%] min-w-80 overflow-y-auto border-r border-line bg-surface/80 p-4"><Sidebar /></aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-[82]"><LunarCanvas /></div>
        <div className="flex-[18] border-t border-line"><TimelineScrubber /></div>
      </section>
    </main>
  )
}
