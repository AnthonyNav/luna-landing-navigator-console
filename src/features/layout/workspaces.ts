import { Activity, Columns2, History, Rocket, type LucideIcon } from 'lucide-react'
import type { Workspace } from '@/core/store/useMissionStore'

export const WORKSPACES: { id: Workspace; label: string; icon: LucideIcon }[] = [
  { id: 'simulate', label: 'Simulate', icon: Activity },
  { id: 'compare', label: 'Compare', icon: Columns2 },
  { id: 'history', label: 'History', icon: History },
  { id: 'missions', label: 'Missions', icon: Rocket },
]
