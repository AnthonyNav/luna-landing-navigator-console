import { Globe2 } from 'lucide-react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { Pill } from '@/ui'

/** Controles discretos sobre el render. Solo lo que ya funciona: volver a la vista global. */
export function SceneControls() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const backToGlobe = useMissionStore((s) => s.backToGlobe)
  if (viewMode !== 'site') return null
  return (
    <Pill onClick={backToGlobe} aria-label="Back to the global view">
      <Globe2 size={14} aria-hidden />Global view
    </Pill>
  )
}
