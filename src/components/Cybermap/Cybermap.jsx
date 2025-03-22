import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CyberGrid } from './CyberGrid'
import { CyberFeatures } from './CyberFeatures'

export const Cybermap = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 10, 20], fov: 60 }}>
        <color attach="background" args={['#000']} />
        
        <Suspense fallback={null}>
          <CyberGrid />
          <CyberFeatures />
        </Suspense>
        
        <ambientLight intensity={0.3} />g
        <directionalLight position={[5, 15, 8]} intensity={1.8} castShadow />
        
        <OrbitControls 
          target={[0, -15, 0]} 
          maxPolarAngle={Math.PI * 0.4} // Further restrict to prevent seeing underside
          minPolarAngle={0.1} // Prevent camera from going completely overhead
          minDistance={20}
          maxDistance={150}
        />
      </Canvas>
    </div>
  )
}