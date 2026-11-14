import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMissionStore } from '@/core/store/useMissionStore'
import { TerrainMesh } from './TerrainMesh'
import { CelestialBodies } from './CelestialBodies'

/** Escena local del sitio (dueña la consola, handoff docs/11 §1). Ocupa todo el fondo. */
export function LunarCanvas() {
  const terrain = useMissionStore((s) => s.terrain)
  return (
    <Canvas camera={{ position: [0, 6000, 9000], far: 100000 }} className="h-full w-full">
      <color attach="background" args={['#04060a']} />
      <CelestialBodies />
      {terrain && <TerrainMesh patch={terrain} />}
      <OrbitControls />
    </Canvas>
  )
}
