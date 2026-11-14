import { useEffect, useState } from 'react'
import { RotateCw, WifiOff } from 'lucide-react'
import { useMissionStore } from '@/core/store/useMissionStore'

const RETRY_S = 20

/**
 * Backend inalcanzable: un ícono junto a la marca. Al pasar el puntero (o enfocarlo con teclado)
 * despliega qué pasa y cuándo se reintenta (Figma C6). Decide por `code`, nunca por el mensaje.
 */
export function ConnectionStatus() {
  const health = useMissionStore((s) => s.health)
  const error = useMissionStore((s) => s.error)
  // Montado solo mientras dura la caída: la cuenta regresiva arranca de cero cada vez.
  return !health && error?.code === 'ERR_NETWORK' ? <OfflineIndicator /> : null
}

function OfflineIndicator() {
  const init = useMissionStore((s) => s.init)
  const [left, setLeft] = useState(RETRY_S)
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => {
      if (s <= 1) { void init(); return RETRY_S }
      return s - 1
    }), 1000)
    return () => clearInterval(id)
  }, [init])
  return (
    <div className="group condense pointer-events-auto relative">
      {/* Aviso único para lectores de pantalla; la cuenta regresiva no se anuncia cada segundo */}
      <span role="alert" className="sr-only">Simulation server unreachable. Retrying automatically.</span>
      <button aria-label="Simulation server unreachable" aria-describedby="offline-info"
        className="glass grid size-9 place-items-center rounded-full text-caution ring-1 ring-caution/45"
        style={{ ['--glass-fill' as string]: 'rgb(42 29 16 / 0.72)' }}>
        {/* Onda que sale del ícono: llama la atención sin ensuciar el glifo */}
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-caution/20 [animation-duration:2.2s] motion-reduce:animate-none" />
        <WifiOff size={16} className="relative" aria-hidden />
      </button>
      {/* pt-2 hace de puente: el puntero puede bajar del ícono a la tarjeta sin cerrarla */}
      <div id="offline-info"
        className="invisible absolute top-full left-0 z-30 w-[300px] pt-2 opacity-0 blur-[3px] translate-y-1 transition-[opacity,translate,filter,visibility] duration-300 ease-[var(--ease-out)]
          group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-[0px]
          group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:blur-[0px]">
        <div className="glass glass-strong flex items-start gap-3 rounded-2xl p-3.5 ring-1 ring-caution/40">
          <WifiOff size={16} className="mt-0.5 shrink-0 text-caution" aria-hidden />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] font-bold">Simulation server unreachable</span>
            <span className="text-xs text-ink-2">Sites and simulations are paused until the connection returns.</span>
            <span className="mt-1 flex items-center gap-3.5 text-xs">
              <button onClick={() => { setLeft(RETRY_S); void init() }} className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-sun">
                <RotateCw size={12} aria-hidden />Retry now</button>
              <span className="tnum text-ink-3" aria-hidden>Retrying in {left} s</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
