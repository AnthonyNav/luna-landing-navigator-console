import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMissionStore } from '@/core/store/useMissionStore'
import { TerrainMesh } from './TerrainMesh'
import { CelestialBodies } from './CelestialBodies'

export function LunarCanvas() {
  const terrain = useMissionStore((s) => s.terrain)
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 6000, 9000], far: 100000 }}>
        <color attach="background" args={['#090d16']} />
        <CelestialBodies />
        {terrain && <TerrainMesh patch={terrain} />}
        <OrbitControls />
      </Canvas>
      {!terrain && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Selecciona un sitio y pulsa “Evaluar misión”
        </div>
      )}
    </div>
  )
}
