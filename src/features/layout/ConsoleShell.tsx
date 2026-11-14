import { useEffect, type ReactNode } from 'react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { SceneBackground } from '@/features/viewport3d/SceneBackground'
import { Rail } from './Rail'
import { FullscreenBar, TopBar } from './TopBar'

export interface WorkspaceSlots { left?: ReactNode; right?: ReactNode; top?: ReactNode; bottom?: ReactNode; overlay?: ReactNode }

/** Franja inferior libre para los créditos NASA/Cesium del globo (handoff docs/11 §2, ≈32 px). */
export const ATTRIBUTION_STRIP = 32

function useFullscreenHotkey() {
  const toggle = useMissionStore((s) => s.toggleFullscreen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key.toLowerCase() !== 'f' || e.metaKey || e.ctrlKey || e.altKey) return
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])
}

function Attribution() {
  const viewMode = useMissionStore((s) => s.viewMode)
  // En vista global el globo pinta sus propios créditos en esta franja; en la escena local los ponemos nosotros.
  if (viewMode === 'globe') return null
  return (
    <p className="pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-ink-3">
      Terrain: LRO LOLA (NASA GSFC) · Ephemeris: NASA/JPL Horizons
    </p>
  )
}

/**
 * Cascarón de la consola: el render es el fondo y todo lo demás flota encima.
 * El contenedor del overlay no captura el puntero (arrastrar el espacio libre mueve el render);
 * cada panel lo reactiva con `pointer-events-auto`.
 */
export function ConsoleShell({ slots }: { slots: WorkspaceSlots }) {
  useFullscreenHotkey()
  const fullscreen = useMissionStore((s) => s.fullscreen)
  return (
    <>
      <SceneBackground />
      <div className="pointer-events-none fixed inset-0 z-10 flex gap-4 p-4" style={{ paddingBottom: ATTRIBUTION_STRIP + 8 }}>
        {!fullscreen && <Rail />}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {fullscreen ? <FullscreenBar /> : <TopBar />}
          <div className="relative flex min-h-0 flex-1 gap-4">
            {slots.left && <div className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto">{slots.left}</div>}
            <div className="relative flex min-w-0 flex-1 flex-col justify-between gap-4">
              <div className="flex flex-wrap items-start gap-2">{slots.top}</div>
              <div className="flex justify-center">{slots.bottom}</div>
            </div>
            {slots.right && <div className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto">{slots.right}</div>}
            {slots.overlay}
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10" style={{ height: ATTRIBUTION_STRIP }}><Attribution /></div>
    </>
  )
}
