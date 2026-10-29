export default function DeskPropsComponent() {
  return (
    <group position={[-2, 0, 0.5]}>
      <group position={[1.75, 0.028, 0.35]} scale={0.9}>
        <mesh position={[0, 0.095, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.19, 20]} />
          <meshStandardMaterial color="#B3402A" roughness={0.35} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.185, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.062, 20]} />
          <meshStandardMaterial color="#2B1A0F" roughness={0.25} />
        </mesh>
        <mesh position={[0.085, 0.095, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.045, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#B3402A" roughness={0.35} metalness={0.05} />
        </mesh>
      </group>

      <group position={[-1.85, 0.028, -0.45]}>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.1, 0.075, 0.18, 16]} />
          <meshStandardMaterial color="#D8CBB8" roughness={0.7} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 16]} />
          <meshStandardMaterial color="#241608" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <icosahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color="#3E7C4F" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0.08, 0.24, 0.05]}>
          <icosahedronGeometry args={[0.085, 0]} />
          <meshStandardMaterial color="#4E9560" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[-0.08, 0.25, -0.04]}>
          <icosahedronGeometry args={[0.075, 0]} />
          <meshStandardMaterial color="#356B44" roughness={0.8} flatShading />
        </mesh>
      </group>

      <group position={[-1.9, 0.028, 0.45]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[0.34, 0.024, 0.46]} />
          <meshStandardMaterial color="#28425C" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[0.006, 0.011, 0]}>
          <boxGeometry args={[0.335, 0.016, 0.44]} />
          <meshStandardMaterial color="#EDE6D6" roughness={0.85} />
        </mesh>
        <mesh position={[0.1, 0.026, 0]}>
          <boxGeometry args={[0.018, 0.004, 0.46]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.6} />
        </mesh>
        <mesh position={[-0.06, 0.033, 0.02]} rotation={[0, 0.5, Math.PI / 2]}>
          <cylinderGeometry args={[0.009, 0.009, 0.3, 10]} />
          <meshStandardMaterial color="#B87333" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
