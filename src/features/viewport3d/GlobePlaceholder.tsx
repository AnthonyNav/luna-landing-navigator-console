/**
 * Fondo de reserva mientras no exista VITE_GLOBE_URL (o si el globo no carga).
 * Es decorativo: no representa datos. Cielo estrellado y el limbo de la Luna.
 */
const STARS = (() => {
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 140 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.5 + rnd() * 1.1, o: 0.15 + rnd() * 0.5 }))
})()

export function GlobePlaceholder() {
  return (
    <div aria-hidden className="relative h-full w-full overflow-hidden bg-sky">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {STARS.map((s, i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#f4f1ea" fillOpacity={s.o} />)}
      </svg>
      <div className="absolute left-1/2 top-[58%] aspect-square w-[min(120vh,110vw)] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle at 38% 30%, #8a8174 0%, #4d473f 32%, #1d1c1f 62%, #08090c 78%)',
          boxShadow: 'inset -40px -60px 120px rgb(0 0 0 / 0.85), 0 0 120px rgb(158 196 255 / 0.12)',
        }} />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  )
}
