import { useMissionStore } from '@/core/store/useMissionStore'
import { vec } from '@/core/utils/coordinates'

const DIST = 9000 // distancia de proyección de las luces (m de escena)

// Capa 3: lee evaluation.timeline[stepIndex] de memoria; cero red.
export function CelestialBodies() {
  const point = useMissionStore((s) => s.evaluation?.timeline[s.stepIndex])
  if (!point) return <ambientLight intensity={0.3} />
  const sun = vec(point.sun_vector_3d).map((x) => x * DIST) as [number, number, number]
  const earth = vec(point.earth_vector_3d).map((x) => x * DIST) as [number, number, number]
  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight position={sun} intensity={point.sun_visible ? 3 : 0.1} color="#f59e0b" />
      <mesh position={sun}><sphereGeometry args={[250]} /><meshBasicMaterial color={point.sun_visible ? '#f59e0b' : '#7f1d1d'} /></mesh>
      <mesh position={earth}><sphereGeometry args={[200]} /><meshBasicMaterial color={point.earth_visible ? '#38bdf8' : '#7f1d1d'} /></mesh>
    </>
  )
}
