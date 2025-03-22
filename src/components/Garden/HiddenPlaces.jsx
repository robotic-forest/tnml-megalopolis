import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, useTexture } from '@react-three/drei';
import { DoubleSide, Vector3 } from 'three';
import { useBox } from '@react-three/cannon';
import { useGardenStore } from './store';
import { useLocation } from 'wouter';

// Ancient shrine
const AncientShrine = ({ position, scale = 0.8 }) => {
  const shrineRef = useRef();
  const glowRef = useRef();
  const particlesRef = useRef();
  const [activated, setActivated] = useState(false);
  const { addDiscoveredSecret } = useGardenStore();
  const [, navigate] = useLocation();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (shrineRef.current) {
      // Subtle movement
      shrineRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
      
      // Rotation and glow when activated
      if (activated) {
        shrineRef.current.rotation.y += 0.002;
        
        if (glowRef.current) {
          glowRef.current.intensity = 0.8 + Math.sin(time * 1.5) * 0.3;
        }
      }
    }
  });
  
  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1, 1.2, 0.2, 8]} />
        <meshStandardMaterial color="#392d49" roughness={0.7} />
      </mesh>
      
      {/* Central obelisk */}
      <mesh ref={shrineRef} position={[0, 0.6, 0]} castShadow>
        <coneGeometry args={[0.4, 1.2, 5]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.2}
          roughness={0.8} 
          emissive={activated ? "#5a3c8f" : "#1a1a2e"}
          emissiveIntensity={activated ? 0.5 : 0}
        />
      </mesh>
      
      {/* Runic markings and small pillars */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0.2, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
              <meshStandardMaterial 
                color="#392d49"
                emissive={activated ? "#5a3c8f" : "#392d49"}
                emissiveIntensity={activated ? 0.5 : 0}
              />
            </mesh>
            
            {/* Runes on ground */}
            <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshStandardMaterial 
                color={activated ? "#a080ff" : "#5a3c8f"}
                emissive={activated ? "#a080ff" : "#5a3c8f"}
                emissiveIntensity={activated ? 1 : 0.3}
                transparent
                opacity={0.8}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Interactive area */}
      <mesh 
        position={[0, 0.6, 0]}
        visible={false}
        onClick={() => {
          if (!activated) {
            setActivated(true);
            setTimeout(() => navigate("/"), 1500); // Navigate to main city
          }
        }}
      >
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Light source */}
      <pointLight 
        ref={glowRef} 
        position={[0, 0.8, 0]} 
        color="#a080ff" 
        intensity={activated ? 0.8 : 0.2} 
        distance={5} 
      />
    </group>
  );
};

// Hidden passage/cave
const HiddenPassage = ({ position, scale = 0.8 }) => {
  const entranceRef = useRef();
  const [revealed, setRevealed] = useState(false);
  const { addDiscoveredSecret } = useGardenStore();
  const [, navigate] = useLocation();
  
  const [colliderRef] = useBox(() => ({
    args: [3 * scale, 2 * scale, 1 * scale],
    position,
    type: 'Static',
    isTrigger: true,
    onCollide: () => {
      if (!revealed) {
        setRevealed(true);
        addDiscoveredSecret();
      }
    }
  }));
  
  useFrame(({ clock }) => {
    if (entranceRef.current && revealed) {
      const time = clock.getElapsedTime();
      entranceRef.current.material.opacity = 0.5 + Math.sin(time) * 0.2;
    }
  });
  
  return (
    <group position={position} scale={scale} ref={colliderRef}>
      {/* Entrance facade */}
      <mesh position={[0, 0, -0.5]} receiveShadow castShadow>
        <boxGeometry args={[3, 2, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>
      
      {/* Hidden entrance */}
      <mesh 
        ref={entranceRef} 
        position={[0, 0, 0.02]} 
        onClick={() => {
          if (!revealed) {
            setRevealed(true);
            addDiscoveredSecret();
          } else {
            // Navigate when clicking on a revealed passage
            setTimeout(() => navigate("/shapes"), 1000);
          }
        }}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial 
          color={revealed ? "#5a3c8f" : "#1a1a2e"}
          emissive={revealed ? "#5a3c8f" : "#1a1a2e"}
          emissiveIntensity={revealed ? 0.5 : 0}
          transparent
          opacity={revealed ? 0.7 : 1}
          side={DoubleSide}
        />
      </mesh>
      
      {/* Entrance decoration */}
      {revealed && (
        <group>
          <pointLight position={[0, 0, 0.5]} color="#a080ff" intensity={0.8} distance={3} />
          
          {/* Runes around entrance */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 1;
            const y = Math.sin(angle) * 1;
            return (
              <mesh key={i} position={[x, y, 0.03]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial 
                  color="#a080ff" 
                  emissive="#a080ff"
                  emissiveIntensity={1}
                  side={DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Display message when revealed */}
      {revealed && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: '#a080ff', 
            padding: '10px', 
            borderRadius: '5px',
            fontFamily: 'monospace'
          }}>
            Click to enter the Shapes Dimension
          </div>
        </Html>
      )}
    </group>
  );
};

// Reflective pool
const ReflectivePool = ({ position, scale = 1 }) => {
  const waterRef = useRef();
  const [active, setActive] = useState(false);
  const { addDiscoveredSecret } = useGardenStore();
  const [, navigate] = useLocation();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (waterRef.current) {
      // Animate water surface
      const vertices = waterRef.current.geometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i += 3) {
        // Only modify y values (which become z in the rotated plane)
        // Skip edge vertices to maintain the circular shape
        const distance = Math.sqrt(vertices[i] * vertices[i] + vertices[i + 2] * vertices[i + 2]);
        if (distance < 1.7) { // Keep the edges stable
          vertices[i + 1] = Math.sin(time * 0.5 + distance * 2) * 0.03;
        }
      }
      waterRef.current.geometry.attributes.position.needsUpdate = true;

      if (active) {
        waterRef.current.material.emissiveIntensity = 0.3 + Math.sin(time) * 0.2;
      }
    }
  });
  
  return (
    <group position={position} scale={scale * 0.8}>
      {/* Pool rim */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <ringGeometry args={[1.8, 2, 32]} />
        <meshStandardMaterial color="#392d49" roughness={0.7} />
      </mesh>
      
      {/* Water surface - using procedural animation instead of textures */}
      <mesh 
        ref={waterRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.1, 0]}
        onClick={() => {
          if (!active) {
            setActive(true);
            addDiscoveredSecret();
            setTimeout(() => navigate("/textures"), 2000); // Navigate after delay
          }
        }}
      >
        <circleGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial 
          color={active ? "#80eaff" : "#1a1a2e"}
          emissive={active ? "#80eaff" : "#1a1a2e"}
          emissiveIntensity={active ? 0.3 : 0}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Center stone */}
      {active && (
        <group position={[0, 0.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.3, 0.2, 8]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color="#80eaff"
              emissive="#80eaff" 
              emissiveIntensity={1.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          
          <pointLight position={[0, 0.3, 0]} color="#80eaff" intensity={1} distance={3} />
        </group>
      )}
      
      {/* Display vision when active */}
      {active && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: '#80eaff', 
            padding: '10px', 
            borderRadius: '5px',
            fontFamily: 'monospace',
            maxWidth: '200px',
            textAlign: 'center'
          }}>
            Entering the Textures Realm...
          </div>
        </Html>
      )}
    </group>
  );
};

export const HiddenPlaces = () => {
  return (
    <group>
      <AncientShrine position={[-6, 0, -3]} />
      <HiddenPassage position={[6, 1, -4]} rotation={[0, Math.PI / 4, 0]} />
      <ReflectivePool position={[0, 0, -8]} />
    </group>
  );
};
