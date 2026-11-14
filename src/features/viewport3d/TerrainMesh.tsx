import { useMemo } from 'react'
import * as THREE from 'three'
import type { TerrainPatch } from '@/types'

// D-008: elevations_m row-major Norte->Sur, Oeste->Este; PlaneGeometry rotada -90° en X.
export function TerrainMesh({ patch, verticalScale = 1 }: { patch: TerrainPatch; verticalScale?: number }) {
  const geometry = useMemo(() => {
    const { size_km, resolution, elevations_m } = patch.grid
    const size = size_km * 1000
    const g = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setY(i, (elevations_m[i] - patch.center.elevation_m) * verticalScale)
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [patch, verticalScale])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#9ca3af" flatShading />
    </mesh>
  )
}
