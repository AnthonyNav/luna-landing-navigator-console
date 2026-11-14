import { useEffect } from 'react'
import { useMissionStore } from '@/core/store/useMissionStore'
import { formatUtc } from '@/core/utils/time'

export function TimelineScrubber() {
  const { evaluation, stepIndex, playing, setStep, setPlaying } = useMissionStore()
  const n = evaluation?.timeline.length ?? 0

  useEffect(() => {
    if (!playing || n === 0) return
    const id = setInterval(() => setStep((useMissionStore.getState().stepIndex + 1) % n), 100)
    return () => clearInterval(id)
  }, [playing, n, setStep])

  if (!evaluation) return <div className="p-4 text-xs text-gray-500">Timeline disponible tras evaluar.</div>
  const p = evaluation.timeline[stepIndex]
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className="rounded border border-line px-3 py-1 text-xs">{playing ? 'Pausa' : 'Play'}</button>
        <span className="tnum text-sm">{formatUtc(p.timestamp_utc)}</span>
        <span className={`text-xs ${p.sun_visible ? 'text-sun' : 'text-nogo'}`}>Sol {p.sun_visible ? '●' : '○'}</span>
        <span className={`text-xs ${p.earth_visible ? 'text-earth' : 'text-nogo'}`}>Tierra {p.earth_visible ? '●' : '○'}</span>
      </div>
      <input type="range" min={0} max={n - 1} value={stepIndex} onChange={(e) => setStep(Number(e.target.value))} className="w-full" />
    </div>
  )
}
