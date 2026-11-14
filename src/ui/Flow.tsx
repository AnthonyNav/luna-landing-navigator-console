// Texto con números que fluyen hacia su valor nuevo (parte del movimiento liquid glass, ver motion.ts).
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './motion'

const NUM = /-?\d+(?:\.\d+)?/g

/**
 * Texto con números que fluyen del valor anterior al nuevo ("2d 10h", "71%", "6.4°").
 * Respeta los decimales de cada número; el texto que no es número queda igual.
 */
export function Flow({ text, duration = 650 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(text)
  const from = useRef<string | null>(null)
  useEffect(() => {
    const prev = from.current
    from.current = text
    const a = prev?.match(NUM) ?? null, b = text.match(NUM)
    const parts = text.split(NUM)
    // Sin números o estructura distinta: cambio directo (la primera vez arranca desde 0)
    if (!b || prefersReducedMotion() || (a && a.length !== b.length)) { setShown(text); return }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - k, 4)
      setShown(parts.map((p, i) => {
        if (i >= b.length) return p
        const to = Number(b[i]), fr = a ? Number(a[i]) : 0
        const dec = b[i].split('.')[1]?.length ?? 0
        return p + (fr + (to - fr) * e).toFixed(dec)
      }).join(''))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, duration])
  return <>{shown}</>
}
