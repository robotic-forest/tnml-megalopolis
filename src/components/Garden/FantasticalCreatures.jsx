import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instances, Instance, Trail, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { MathUtils, Vector3, Object3D } from 'three';

// Floating ethereal being
const FloatingSpirit = ({ position, color = '#a080ff', scale = 1 }) => {
  const bodyRef = useRef();
  const trailRef = useRef();
  const initialPosition = useMemo(() => new Vector3(...position), [position]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (bodyRef.current) {
      // Floating movement pattern
      bodyRef.current.position.y = initialPosition.y + Math.sin(time * 0.8) * 0.5;
      bodyRef.current.position.x = initialPosition.x + Math.cos(time * 0.5) * 0.3;
      bodyRef.current.position.z = initialPosition.z + Math.sin(time * 0.3) * 0.3;
      
      // Gentle rotation
      bodyRef.current.rotation.y = time * 0.2;
      bodyRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
    }
  });
  
  return (
    <group>
      <Trail
        ref={trailRef}
        width={2}
        length={8}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={bodyRef} position={position} scale={scale}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            transparent
            opacity={0.7}
          />
        </mesh>
      </Trail>
    </group>
  );
};

// Small flying creatures that move in patterns
const FlyingFamiliar = ({ startPosition, color = '#ff80bf', scale = 0.2 }) => {
  const ref = useRef();
  const time = useRef(Math.random() * 100);
  const centerPoint = useMemo(() => new Vector3(...startPosition), [startPosition]);
  
  useFrame((state) => {
    time.current += 0.01;
    const t = time.current;
    
    if (ref.current) {
      // Create a complex flight pattern
      ref.current.position.x = centerPoint.x + Math.sin(t * 2) * 1.5;
      ref.current.position.y = centerPoint.y + Math.cos(t * 1.5) * 0.5 + Math.sin(t * 3) * 0.2;
      ref.current.position.z = centerPoint.z + Math.cos(t * 2) * 1.5;
      
      // Rotate to face movement direction
      const targetX = centerPoint.x + Math.sin(t * 2 + 0.01) * 1.5;
      const targetZ = centerPoint.z + Math.cos(t * 2 + 0.01) * 1.5;
      ref.current.lookAt(targetX, ref.current.position.y, targetZ);
    }
  });
  
  return (
    <group ref={ref} position={startPosition} scale={scale}>
      {/* Body - using sphereGeometry with non-uniform scaling instead of ellipsoidGeometry */}
      <mesh castShadow scale={[0.8, 0.4, 0.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Wings */}
      <mesh castShadow rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 1.2, 0.05]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6} 
        />
      </mesh>
      <mesh castShadow rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.1, 1.2, 0.05]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6} 
        />
      </mesh>
      
      {/* Glow */}
      <pointLight color={color} intensity={0.3} distance={1} />
    </group>
  );
};

// Partially phased creature
const PhasedCreature = ({ position, color = '#80ffea', scale = 1 }) => {
  const ref = useRef();
  const phaseRef = useRef(0);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (ref.current) {
      // Pulsing effect that makes the creature appear to phase in and out
      phaseRef.current = (Math.sin(time * 0.5) + 1) / 2;
      ref.current.material.opacity = 0.2 + phaseRef.current * 0.5;
      
      // Gentle floating and rotation
      ref.current.position.y = position[1] + Math.sin(time * 0.3) * 0.2;
      ref.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <group position={position} scale={scale}>
      <mesh ref={ref} castShadow>
        <torusKnotGeometry args={[0.4, 0.15, 100, 16]} />
        <meshPhysicalMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
};

export const FantasticalCreatures = () => {
  return (
    <group>
      {/* Floating spirits */}
      <FloatingSpirit position={[-2, 2, -3]} color="#a080ff" />
      <FloatingSpirit position={[3, 3, 1]} color="#80ffea" scale={1.2} />
      <FloatingSpirit position={[-1, 4, 4]} color="#ff80bf" scale={0.8} />
      
      {/* Flying familiars */}
      <FlyingFamiliar startPosition={[0, 1.5, 0]} color="#ffca80" />
      <FlyingFamiliar startPosition={[2, 2, -2]} color="#8aff80" />
      <FlyingFamiliar startPosition={[-3, 1, 2]} color="#80eaff" />
      <FlyingFamiliar startPosition={[4, 2.5, 3]} color="#a080ff" />
      <FlyingFamiliar startPosition={[-2, 3, -1]} color="#ff80bf" />
      
      {/* Phased creatures */}
      <PhasedCreature position={[2, 0.5, 2]} color="#80ffea" />
      <PhasedCreature position={[-4, 1, -2]} color="#a080ff" scale={1.4} />
      <PhasedCreature position={[0, 0.7, -5]} color="#ff80bf" scale={0.7} />
    </group>
  );
};
