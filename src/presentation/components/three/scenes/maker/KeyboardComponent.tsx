import { useEffect, useMemo } from 'react'
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import type { makerColors } from '@domain/data/makerRack'

// Keycap palette
const LIGHT = '#F5F5F0'
const GRAY = '#B8C5D0'
const NAVY = '#2C3E50'

// [x, z, width, height, depth, colour] — y is always 0.055
type KeyDef = [number, number, number, number, number, string]

const buildKeyDefs = (): KeyDef[] => {
  const keys: KeyDef[] = []
  // Escape
  keys.push([-0.562, -0.15, 0.06, 0.035, 0.049, NAVY])
  // Function row: F1-F4 light, F5-F8 gray-blue, F9-F12 light
  for (let k = 1; k <= 4; k++) keys.push([-0.435 + k * 0.071, -0.15, 0.053, 0.03, 0.041, LIGHT])
  for (let k = 1; k <= 4; k++) keys.push([-0.15 + k * 0.071, -0.15, 0.053, 0.03, 0.041, GRAY])
  for (let k = 1; k <= 4; k++) keys.push([0.135 + k * 0.071, -0.15, 0.053, 0.03, 0.041, LIGHT])
  // Number row + Backspace + Delete
  for (let k = 1; k <= 13; k++) keys.push([-0.54 + k * 0.071, -0.075, 0.056, 0.035, 0.053, LIGHT])
  keys.push([0.435, -0.075, 0.09, 0.035, 0.053, GRAY])
  keys.push([0.54, -0.075, 0.053, 0.035, 0.053, GRAY])
  // QWERTY row: Tab + letters + PgUp
  keys.push([-0.562, 0, 0.075, 0.035, 0.053, GRAY])
  for (let k = 1; k <= 12; k++) keys.push([-0.45 + k * 0.071, 0, 0.056, 0.035, 0.053, LIGHT])
  keys.push([0.54, 0, 0.053, 0.035, 0.053, GRAY])
  // Home row: Caps + letters + Enter + PgDn
  keys.push([-0.548, 0.068, 0.09, 0.035, 0.053, GRAY])
  for (let k = 1; k <= 10; k++) keys.push([-0.412 + k * 0.071, 0.068, 0.056, 0.035, 0.053, LIGHT])
  keys.push([0.39, 0.068, 0.105, 0.035, 0.053, NAVY])
  keys.push([0.54, 0.068, 0.053, 0.035, 0.053, GRAY])
  // Bottom row: LShift + letters + RShift + Up arrow
  keys.push([-0.525, 0.135, 0.112, 0.035, 0.053, GRAY])
  for (let k = 1; k <= 9; k++) keys.push([-0.375 + k * 0.071, 0.135, 0.056, 0.035, 0.053, LIGHT])
  keys.push([0.337, 0.135, 0.075, 0.035, 0.053, GRAY])
  keys.push([0.435, 0.135, 0.053, 0.035, 0.053, NAVY])
  // Space row: Ctrl/Win/Alt + Space + Fn/Ctrl + arrows
  for (let i = 0; i < 3; i++) keys.push([-0.525 + i * 0.075, 0.203, 0.06, 0.035, 0.053, GRAY])
  keys.push([-0.075, 0.203, 0.337, 0.035, 0.053, NAVY])
  for (let i = 0; i < 2; i++) keys.push([0.165 + i * 0.075, 0.203, 0.06, 0.035, 0.053, GRAY])
  keys.push([0.337, 0.203, 0.053, 0.035, 0.053, NAVY])
  keys.push([0.435, 0.203, 0.053, 0.035, 0.053, NAVY])
  keys.push([0.532, 0.203, 0.053, 0.035, 0.053, NAVY])
  return keys
}

interface Props {
  colors: typeof makerColors
}

// Equivalent of Vue's `v-for="x in n"`: [1..n]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function KeyboardComponent(_props: Props) {
  const keysMesh = useMemo(() => {
    const defs = buildKeyDefs()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshStandardMaterial({ roughness: 0.45 })
    const mesh = new InstancedMesh(geometry, material, defs.length)
    const matrix = new Matrix4()
    const quat = new Quaternion()
    const pos = new Vector3()
    const scale = new Vector3()
    const color = new Color()
    defs.forEach(([x, z, w, h, d, c], i) => {
      matrix.compose(pos.set(x, 0.055, z), quat, scale.set(w, h, d))
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, color.set(c))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    return mesh
  }, [])

  useEffect(() => () => {
    keysMesh.geometry.dispose()
    ;(keysMesh.material as MeshStandardMaterial).dispose()
    keysMesh.dispose()
  }, [keysMesh])

  return (
    <group position={[-2, 0.08, 0.8]} scale={0.8}>
      {/* Main keyboard body - white/cream */}
      <mesh>
        <boxGeometry args={[1.275, 0.07, 0.412]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Keyboard top bezel */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.238, 0.015, 0.375]} />
        <meshStandardMaterial color="#F0EDE5" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* ===== ROTARY KNOB (top right) ===== */}
      <group position={[0.54, 0.06, -0.15]}>
        {/* Knob base */}
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 24]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Knob top */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
          <meshStandardMaterial color="#A0A0A0" roughness={0.15} metalness={0.9} />
        </mesh>
        {/* Knob grip lines */}
        {range(12).map((line) => (
          <mesh key={`knob-${line}`}
            position={[Math.cos(line * Math.PI / 6) * 0.048, 0.025, Math.sin(line * Math.PI / 6) * 0.048]}>
            <boxGeometry args={[0.004, 0.015, 0.008]} />
            <meshStandardMaterial color="#707070" metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ===== KEYS =====
           All 86 keycaps in ONE InstancedMesh (single draw call, per-instance
           colour) instead of 86 meshes each carrying its own material. */}
      <primitive object={keysMesh} />

    </group>
  )
}
