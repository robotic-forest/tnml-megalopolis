import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function DNAHelix({ scale = 1, position = [0, 0, 0], speed = 1 }) {
  const groupRef = useRef()
  const numPoints = 100

  const { points } = useMemo(() => {
    // Create points along the vertical path
    const points = Array.from({ length: numPoints }, (_, i) => {
      const t = i / (numPoints - 1)
      const y = (t * 4 - 2) * scale // Vertical height
      
      // Make radius approach zero at the top using a smooth easing
      const easeOut = 1 - Math.pow(t, 2) // Quadratic ease out for smoother taper
      const radius = scale * 0.8 * easeOut // Base radius scaled down smoothly to zero
      
      return {
        y,
        radius,
        angle: t * Math.PI * 8 // 4 full rotations
      }
    })

    return { points }
  }, [scale])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed
    }
  })

  return (
    <>
      {/* Static center pillar */}
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[0.005 * scale, 0.005 * scale, 4.3 * scale, 8]} />
          <meshStandardMaterial 
            color="#303030"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Rotating helix group */}
      <group ref={groupRef} position={position}>
        {/* Top box */}
        <mesh position={[0, 2.15 * scale, 0]}>
          <boxGeometry args={[0.2 * scale, 0.2 * scale, 0.2 * scale]} />
          <meshStandardMaterial 
            color="#cadfe7"
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>

        {/* First spiral line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={numPoints}
              array={new Float32Array(points.map(p => [
                Math.cos(p.angle) * p.radius,
                p.y,
                Math.sin(p.angle) * p.radius
              ]).flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#404040" linewidth={2} />
        </line>
        
        {/* Second spiral line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={numPoints}
              array={new Float32Array(points.map(p => [
                Math.cos(p.angle + Math.PI) * p.radius,
                p.y,
                Math.sin(p.angle + Math.PI) * p.radius
              ]).flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#404040" linewidth={2} />
        </line>
      </group>
    </>
  )
}

function Scene() {
  return (
    <group>
      {/* Main center helix */}
      <DNAHelix 
        scale={2.5} 
        position={[0, -3, 0]} 
        speed={0.5}
      />
      
      {/* Left smaller helix */}
      <DNAHelix 
        scale={1.8} 
        position={[-5.4, -4, 0]} 
        speed={0.7}
      />
      
      {/* Right smallest helix */}
      <DNAHelix 
        scale={1.4} 
        position={[3.5, -2.8, 0]} 
        speed={0.9}
      />
    </group>
  )
}

export default function Graphic() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas 
        camera={{ 
          position: [8, 0, 8], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Scene />
      </Canvas>
    </div>
  )
}