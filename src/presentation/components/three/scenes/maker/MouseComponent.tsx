export default function MouseComponent() {
  return (
    <>
      <group position={[-1.0, 0.05, 0.75]}>
        <mesh>
          <boxGeometry args={[0.143, 0.091, 0.245]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.4} metalness={0.1} />
        </mesh>

        <mesh position={[0, 0.036, 0.016]}>
          <boxGeometry args={[0.133, 0.036, 0.207]} />
          <meshStandardMaterial color="#4D4D4D" roughness={0.35} metalness={0.1} />
        </mesh>

        <mesh position={[-0.028, 0.068, -0.054]}>
          <boxGeometry args={[0.051, 0.014, 0.109]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.3} />
        </mesh>

        <mesh position={[0.028, 0.068, -0.054]}>
          <boxGeometry args={[0.051, 0.014, 0.109]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.3} />
        </mesh>

        <mesh position={[0, 0.073, -0.044]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.016, 16]} />
          <meshStandardMaterial color="#606060" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      <group position={[-2, 0.06, 0.65]}>
        <mesh>
          <boxGeometry args={[3.0, 0.025, 1.5]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.9} metalness={0} />
        </mesh>
      </group>
    </>
  )
}
