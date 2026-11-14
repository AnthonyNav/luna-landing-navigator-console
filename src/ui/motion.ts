// Movimiento "liquid glass" sin dependencias: luz que sigue al puntero, indicador deslizante,
// View Transitions entre estados del cascarón y números que fluyen hacia su valor nuevo.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Escribe la posición del puntero (relativa a cada superficie) en --lx/--ly del vidrio y del control
 * que hay debajo. El CSS (index.css) la usa para el reflejo y el borde encendido.
 */
export function useLiquidLight() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let frame = 0, last: PointerEvent | null = null
    const paint = () => {
      frame = 0
      const e = last, t = e?.target
      if (!e || !(t instanceof Element)) return
      for (const el of [t.closest('.glass'), t.closest('.raised, .btn-primary')]) {
        if (!(el instanceof HTMLElement)) continue
        const r = el.getBoundingClientRect()
        el.style.setProperty('--lx', `${e.clientX - r.left}px`)
        el.style.setProperty('--ly', `${e.clientY - r.top}px`)
      }
    }
    const onMove = (e: PointerEvent) => { last = e; if (!frame) frame = requestAnimationFrame(paint) }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame) }
  }, [])
}

type VTDocument = Document & { startViewTransition?: (cb: () => void) => unknown }

/** Cambio de estado con View Transition: los huecos con view-transition-name se transforman entre sí. */
export function withViewTransition(update: () => void) {
  const doc = document as VTDocument
  if (!doc.startViewTransition || prefersReducedMotion()) return update()
  doc.startViewTransition(() => flushSync(update))
}

/**
 * Indicador que se desliza hasta la opción activa (`data-active="true"`) y se estira al moverse.
 * Devuelve la ref del contenedor (position: relative) y la del indicador.
 */
export function useGlider<T extends HTMLElement = HTMLDivElement>(activeKey: unknown) {
  const box = useRef<T>(null)
  const glider = useRef<HTMLSpanElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 })
  const first = useRef(true)
  const ready = useRef(false)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const on = el.querySelector<HTMLElement>('[data-active="true"]')
      if (!on) return setStyle({ opacity: 0 })
      setStyle({ transition: ready.current ? GLIDE : 'none', opacity: 1, width: on.offsetWidth, height: on.offsetHeight, transform: `translate(${on.offsetLeft}px, ${on.offsetTop}px)` })
    }
    measure()
    requestAnimationFrame(() => { ready.current = true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeKey])
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (prefersReducedMotion()) return
    glider.current?.animate([{ scale: '1 1' }, { scale: '1.1 0.86', offset: 0.35 }, { scale: '0.97 1.04', offset: 0.7 }, { scale: '1 1' }],
      { duration: 520, easing: 'ease-out' })
  }, [activeKey])
  return { box, glider, style }
}

/** Clases del indicador: se mueve con resorte; el tamaño acompaña con una curva sin rebote. */
export const GLIDER = 'raised pointer-events-none absolute top-0 left-0'
const GLIDE = 'transform 520ms var(--ease-spring), width 420ms var(--ease-out), height 420ms var(--ease-out), opacity 200ms ease-out'
