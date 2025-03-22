import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles, Html } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { DoubleSide } from 'three';
import { useLocation } from 'wouter';

// Hovering rune stone - links to Ancient City
const RuneStone = ({ position, color = '#a080ff', scale = 0.7 }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [, navigate] = useLocation();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (ref.current) {
      // Hovering effect
      ref.current.position.y = position[1] + Math.sin(time * 0.8) * 0.1;
      // Slow rotation
      ref.current.rotation.y += 0.002;
      
      // Pulsing glow when hovered
      if (hovered) {
        ref.current.material.emissiveIntensity = 1 + Math.sin(time * 5) * 0.5;
      } else {
        ref.current.material.emissiveIntensity = 0.5;
      }
    }
  });
  
  return (
    <group position={position} scale={scale}>
      <mesh 
        ref={ref} 
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!interacted) {
            setInteracted(true);
            setTimeout(() => navigate("/"), 1000); // Navigate to Ancient City after animation
          }
        }}
      >
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Runes that float around the stone */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group
            key={i}
            position={[x, Math.sin(i) * 0.2, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            {/* Simple rune symbol using geometry */}
            <mesh>
              <boxGeometry args={[0.1, 0.15, 0.01]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
              />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0, 0.05, 0.01]}>
                <boxGeometry args={[0.05, 0.05, 0.01]} />
                <meshStandardMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      })}    
      <pointLight color={color} intensity={0.8} distance={2} />
    </group>
  );
};

// Ancient monolith - links to Procedural Textures
const Monolith = ({ position, rotation = [0, 0, 0], scale = 0.7, color = "#1a1a2e" }) => {
  const ref = useRef();
  const glowRef = useRef();
  const [interacted, setInteracted] = useState(false);
  const [, navigate] = useLocation();
  
  const [boxRef] = useBox(() => ({
    mass: 0,
    type: 'Static',
    position,
    rotation,
    args: [0.5 * scale, 3 * scale, 0.5 * scale],
  }));
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.intensity = 0.5 + Math.sin(time * 0.5) * 0.2;
    }
    
    if (ref.current && interacted) {
      // Subtle pulse effect when interacted with
      ref.current.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group ref={boxRef} position={position} rotation={rotation} scale={scale}>
      <mesh 
        ref={ref} 
        castShadow 
        receiveShadow
        onClick={() => {
          if (!interacted) {
            setInteracted(true);
            setTimeout(() => navigate("/textures"), 1000); // Navigate to Textures after animation
          }
        }}
      >
        <boxGeometry args={[0.5, 3, 0.5]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6}
          metalness={0.2}
          emissive={interacted ? "#5a3c8f" : color}
          emissiveIntensity={interacted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Glowing rune patterns on the monolith */}
      {interacted && [...Array(5)].map((_, i) => (
        <group key={i} position={[0, -1 + i * 0.7, 0.251]}>
          <mesh>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial 
              color="#a080ff"
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.15, 0.02]} />
            <meshBasicMaterial color="#a080ff" />
          </mesh>
          <mesh position={[0, 0, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.15, 0.02]} />
            <meshBasicMaterial color="#a080ff" />
          </mesh>
        </group>
      ))}
      
      <pointLight ref={glowRef} position={[0, 1.5, 0]} color="#a080ff" intensity={0.5} distance={3} />
    </group>
  );
};

// Reality tear/portal - links to Shapes
const RealityTear = ({ position, scale = 0.7 }) => {
  const discRef = useRef();
  const [active, setActive] = useState(false);
  const [, navigate] = useLocation();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (discRef.current) {
      discRef.current.rotation.z += 0.005;
      // Pulsing effect
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      discRef.current.scale.set(pulse, pulse, 1);
    }
  });
  
  return (
    <group position={position} scale={scale}>
      <mesh 
        ref={discRef} 
        rotation={[Math.PI / 2, 0, 0]}
        onClick={() => {
          if (!active) {
            setActive(true);
            setTimeout(() => navigate("/shapes"), 1000); // Navigate to Shapes after animation
          }
        }}
      >
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial 
          color="#080820" 
          side={DoubleSide} 
          emissive={active ? "#5a3c8f" : "#080820"}
          emissiveIntensity={active ? 1 : 0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Edge glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.7, 32]} />
        <meshStandardMaterial 
          color={active ? "#a080ff" : "#5a3c8f"} 
          emissive={active ? "#a080ff" : "#5a3c8f"}
          emissiveIntensity={active ? 2 : 1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Particles around the portal */}
      {active && (
        <Sparkles 
          count={20} 
          scale={1.5} 
          size={0.2} 
          speed={0.3} 
          color="#a080ff" 
          position={[0, 0.1, 0]} 
        />
      )}
      <pointLight color="#a080ff" intensity={active ? 1 : 0.3} distance={3} />
    </group>
  );
};

// Crystal of power - links to Extrusions
const PowerCrystal = ({ position, color = "#ff80bf", scale = 0.7 }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [, navigate] = useLocation();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (ref.current) {
      // Crystal rotation
      ref.current.rotation.y += 0.005;
      
      // Glow intensity based on state
      if (active) {
        ref.current.material.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
      } else if (hovered) {
        ref.current.material.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.2;
      } else {
        ref.current.material.emissiveIntensity = 0.3;
      }
    }
  });
  
  return (
    <group position={position} scale={scale}>
      <mesh 
        ref={ref}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!active) {
            setActive(true);
            setTimeout(() => navigate("/extrusions"), 1000); // Navigate to Extrusions after animation
          }
        }}
      >
        <octahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          transmission={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight color={color} intensity={active ? 1 : 0.3} distance={3} />
    </group>
  );
};

export const ObjectsOfPower = () => {
  return (
    <group>
      {/* Rune stones */}
      <RuneStone position={[-3, 0.5, 0]} color="#a080ff" />
      <RuneStone position={[2.5, 0.5, 3.5]} color="#80ffea" scale={0.5} />
      <RuneStone position={[1, 0.5, -4]} color="#ff80bf" scale={0.8} />
      
      {/* Monoliths */}
      <Monolith position={[-5, 1.5, -5]} rotation={[0, Math.PI / 6, 0]} scale={0.8} />
      <Monolith position={[5, 1.5, -1]} rotation={[0, Math.PI / 4, 0]} scale={0.7} />
      <Monolith position={[0, 1.5, 6]} rotation={[0, -Math.PI / 5, 0]} scale={0.6} />
      
      {/* Reality tears */}
      <RealityTear position={[4, 0.1, 6]} />
      <RealityTear position={[-3, 0.1, -6]} scale={0.5} />
      
      {/* Crystals */}
      <PowerCrystal position={[0, 1, 0]} color="#ff80bf" />
      <PowerCrystal position={[-4, 1, 4]} color="#80ffea" scale={0.9} />
      <PowerCrystal position={[3, 1, -4.5]} color="#a080ff" scale={0.6} />
    </group>
  );
};