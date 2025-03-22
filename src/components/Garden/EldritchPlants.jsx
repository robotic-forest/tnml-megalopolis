import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, MeshWobbleMaterial, useTexture } from '@react-three/drei';
import { MathUtils, Vector3 } from 'three';
import { useBox } from '@react-three/cannon';

const TentaclePlant = ({ position, scale = 1, color = '#4d1d4d' }) => {
  const ref = useRef();
  
  // Create refs at the top level instead of inside useMemo
  const tentacleRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef()
  ];
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Make the plant sway gently
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    }
    
    // Animate each tentacle independently
    tentacleRefs.forEach((tentacle, i) => {
      if (tentacle.current) {
        tentacle.current.rotation.x = Math.sin(t * 0.3 + i * 0.5) * 0.2;
        tentacle.current.rotation.z = Math.cos(t * 0.2 + i * 0.3) * 0.2;
      }
    });
  });
  
  return (
    <group position={position} ref={ref} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 0.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      
      {/* Tentacles */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group 
            key={i}
            ref={tentacleRefs[i]} 
            position={[x, 0.25, z]}
            rotation={[Math.random() * 0.2, 0, Math.random() * 0.2]}
          >
            {[...Array(3)].map((_, j) => (
              <mesh key={j} position={[0, j * 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.05 - j * 0.01, 0.08 - j * 0.01, 0.3, 5]} />
                <MeshWobbleMaterial 
                  factor={0.4} 
                  speed={0.5} 
                  color={color} 
                  metalness={0.1}
                  roughness={0.6} 
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};

const GlowingMushroom = ({ position, scale = 1, color = '#80ffea' }) => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.intensity = 0.5 + Math.sin(t * 2) * 0.2;
    }
  });
  
  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.2, 8]} />
        <meshStandardMaterial color="#d8d0c3" roughness={0.7} />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight ref={ref} color={color} intensity={0.5} distance={2} />
    </group>
  );
};

export const EldritchPlants = () => {
  return (
    <group>
      <TentaclePlant position={[-3, 0, -2]} scale={1.2} color="#4d1d4d" />
      <TentaclePlant position={[4, 0, -3]} scale={0.8} color="#1d4d33" />
      <TentaclePlant position={[2, 0, 4]} color="#4d3d1d" />
      <TentaclePlant position={[-5, 0, 3]} scale={1.5} color="#301d4d" />
      
      {/* Clusters of glowing mushrooms */}
      <group position={[-2, 0, -4]}>
        <GlowingMushroom position={[0, 0, 0]} color="#80ffea" />
        <GlowingMushroom position={[0.2, 0, 0.3]} scale={0.7} color="#80ffea" />
        <GlowingMushroom position={[-0.2, 0, 0.2]} scale={0.8} color="#80eaff" />
        <GlowingMushroom position={[0.1, 0, -0.3]} scale={0.6} color="#a080ff" />
      </group>
      
      <group position={[3, 0, 2]}>
        <GlowingMushroom position={[0, 0, 0]} color="#ff80bf" />
        <GlowingMushroom position={[0.3, 0, 0.2]} scale={0.9} color="#ff80bf" />
        <GlowingMushroom position={[-0.2, 0, 0.3]} scale={0.7} color="#ffca80" />
      </group>
      
      <group position={[-4, 0, 5]}>
        <GlowingMushroom position={[0, 0, 0]} scale={1.2} color="#8aff80" />
        <GlowingMushroom position={[0.4, 0, -0.1]} scale={0.8} color="#8aff80" />
        <GlowingMushroom position={[0.2, 0, 0.4]} scale={0.5} color="#80ff9e" />
      </group>
    </group>
  );
};
