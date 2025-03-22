import { Canvas, useFrame } from '@react-three/fiber'
import { Edges, OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function DNAHelix({ scale = 1, position = [0, 0, 0], speed = 1, rotationDirection = 1 }) {
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
      groupRef.current.rotation.y = clock.getElapsedTime() * speed * rotationDirection
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
          <Edges
            threshold={15}
            color="black"
            scale={2}
            opacity={0.3}
          />
          <Edges
            threshold={15}
            color="black"
            scale={1.5}
            opacity={0.7}
          />
          <Edges
            threshold={15}
            color="black"
            scale={1}
            opacity={1}
          />
        </mesh>

        {/* First spiral line */}
        <line rotation={[Math.PI, 0, 0]} position={[0, -0.3 * scale, 0]}>
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
          <lineBasicMaterial color="#000000" linewidth={2} transparent={true} opacity={0.6} />
        </line>
  

        {/* End sphere for first spiral */}
        <mesh position={[
          Math.cos(points[points.length - 1].angle) * points[points.length - 1].radius + (0.8 * scale),
          points[points.length - 1].y - 0.3 * scale,
          Math.sin(points[points.length - 1].angle) * points[points.length - 1].radius
        ]}>
          <sphereGeometry args={[0.04 * scale, 8, 8]} />
          <meshStandardMaterial color="#000000" opacity={1} transparent={true} />
        </mesh>
        
        {/* Second spiral line */}
        <line rotation={[Math.PI, 0, 0]} position={[0, -0.3 * scale, 0]}>
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
          <lineBasicMaterial color="#000000" linewidth={2} transparent={true} opacity={0.6} />
        </line>

        {/* End sphere for second spiral */}
        <mesh position={[
          Math.cos(points[points.length - 1].angle + Math.PI) * points[points.length - 1].radius  - (0.8 * scale),
          points[points.length - 1].y - 0.3 * scale,
          Math.sin(points[points.length - 1].angle + Math.PI) * points[points.length - 1].radius
        ]}>
          <sphereGeometry args={[0.04 * scale, 8, 8]} />
          <meshStandardMaterial color="#000000" opacity={1} transparent={true} />
        </mesh>
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
        speed={0.3}
        rotationDirection={-1}
      />
      
      {/* Left smaller helix */}
      <DNAHelix 
        scale={1.8} 
        position={[-6, -6, 0]} 
        speed={0.4}
        rotationDirection={1}
      />
      
      {/* Right smallest helix */}
      <DNAHelix 
        scale={1.4} 
        position={[4, -2.8, 0]} 
        speed={0.2}
        rotationDirection={1}
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
          fov: 55,
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