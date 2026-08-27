import type { makerColors } from '@domain/data/makerRack'

interface Props {
  colors: typeof makerColors
}

// Equivalent of Vue's `v-for="x in n"`: [1..n]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function KeyboardComponent(_props: Props) {
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

      {/* ===== ESCAPE KEY (dark navy) ===== */}
      <mesh position={[-0.562, 0.055, -0.15]}>
        <boxGeometry args={[0.06, 0.035, 0.049]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.5} />
      </mesh>

      {/* ===== FUNCTION ROW ===== */}
      {/* F1-F4 (light) */}
      {range(4).map((key) => (
        <mesh key={`f1-4-${key}`} position={[-0.435 + key * 0.071, 0.055, -0.15]}>
          <boxGeometry args={[0.053, 0.03, 0.041]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}
      {/* F5-F8 (gray-blue) */}
      {range(4).map((key) => (
        <mesh key={`f5-8-${key}`} position={[-0.15 + key * 0.071, 0.055, -0.15]}>
          <boxGeometry args={[0.053, 0.03, 0.041]} />
          <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
        </mesh>
      ))}
      {/* F9-F12 (light) */}
      {range(4).map((key) => (
        <mesh key={`f9-12-${key}`} position={[0.135 + key * 0.071, 0.055, -0.15]}>
          <boxGeometry args={[0.053, 0.03, 0.041]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}

      {/* ===== NUMBER ROW (white keys) ===== */}
      {range(13).map((key) => (
        <mesh key={`num-${key}`} position={[-0.54 + key * 0.071, 0.055, -0.075]}>
          <boxGeometry args={[0.056, 0.035, 0.053]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}
      {/* Backspace (gray-blue) */}
      <mesh position={[0.435, 0.055, -0.075]}>
        <boxGeometry args={[0.09, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>
      {/* Delete */}
      <mesh position={[0.54, 0.055, -0.075]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>

      {/* ===== QWERTY ROW ===== */}
      {/* Tab (gray-blue) */}
      <mesh position={[-0.562, 0.055, 0]}>
        <boxGeometry args={[0.075, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>
      {/* Letter keys (white) */}
      {range(12).map((key) => (
        <mesh key={`qwerty-${key}`} position={[-0.45 + key * 0.071, 0.055, 0]}>
          <boxGeometry args={[0.056, 0.035, 0.053]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}
      {/* PgUp */}
      <mesh position={[0.54, 0.055, 0]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>

      {/* ===== HOME ROW ===== */}
      {/* Caps Lock (gray-blue) */}
      <mesh position={[-0.548, 0.055, 0.068]}>
        <boxGeometry args={[0.09, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>
      {/* Letter keys (white) */}
      {range(10).map((key) => (
        <mesh key={`home-${key}`} position={[-0.412 + key * 0.071, 0.055, 0.068]}>
          <boxGeometry args={[0.056, 0.035, 0.053]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}
      {/* Enter (dark navy) */}
      <mesh position={[0.39, 0.055, 0.068]}>
        <boxGeometry args={[0.105, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>
      {/* PgDn */}
      <mesh position={[0.54, 0.055, 0.068]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>

      {/* ===== BOTTOM ROW ===== */}
      {/* Left Shift (gray-blue) */}
      <mesh position={[-0.525, 0.055, 0.135]}>
        <boxGeometry args={[0.112, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>
      {/* Letter keys (white) */}
      {range(9).map((key) => (
        <mesh key={`shift-row-${key}`} position={[-0.375 + key * 0.071, 0.055, 0.135]}>
          <boxGeometry args={[0.056, 0.035, 0.053]} />
          <meshStandardMaterial color="#F5F5F0" roughness={0.45} />
        </mesh>
      ))}
      {/* Right Shift */}
      <mesh position={[0.337, 0.055, 0.135]}>
        <boxGeometry args={[0.075, 0.035, 0.053]} />
        <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
      </mesh>
      {/* Up arrow (dark) */}
      <mesh position={[0.435, 0.055, 0.135]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>

      {/* ===== SPACE ROW ===== */}
      {/* Ctrl, Win, Alt (gray-blue) */}
      {range(3).map((_key, i) => (
        <mesh key={`mod-left-${i}`} position={[-0.525 + i * 0.075, 0.055, 0.203]}>
          <boxGeometry args={[0.06, 0.035, 0.053]} />
          <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
        </mesh>
      ))}
      {/* Spacebar (dark navy) */}
      <mesh position={[-0.075, 0.055, 0.203]}>
        <boxGeometry args={[0.337, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>
      {/* Fn, Ctrl right (gray-blue) */}
      {range(2).map((_key, i) => (
        <mesh key={`mod-right-${i}`} position={[0.165 + i * 0.075, 0.055, 0.203]}>
          <boxGeometry args={[0.06, 0.035, 0.053]} />
          <meshStandardMaterial color="#B8C5D0" roughness={0.45} />
        </mesh>
      ))}
      {/* Arrow keys (dark) */}
      <mesh position={[0.337, 0.055, 0.203]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>
      <mesh position={[0.435, 0.055, 0.203]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>
      <mesh position={[0.532, 0.055, 0.203]}>
        <boxGeometry args={[0.053, 0.035, 0.053]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.45} />
      </mesh>
    </group>
  )
}
