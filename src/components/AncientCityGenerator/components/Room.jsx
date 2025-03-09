import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useProceduralMaterial } from '../../../components/ProceduralTextures/hooks/useProceduralMaterial';

const Room = ({ vertices, height, age, wireframe = false, castShadow = true, receiveShadow = true }) => {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    vertices.forEach((vertex, index) => {
      if (index === 0) {
        shape.moveTo(vertex.x, vertex.y);
      } else {
        shape.lineTo(vertex.x, vertex.y);
      }
    });
    shape.closePath();
    return shape;
  }, [vertices]);
  
  // Lighter, less saturated base colors
  const baseRed = 0.88;     // Increased from 0.85
  const baseGreen = 0.82;   // Increased from 0.75 (closer to red for less saturation)
  const baseBlue = 0.70;    // Increased from 0.55 (much closer to green for less saturation)
  
  // Reduced age-based darkening to keep rooms lighter
  const colorValue = baseRed - age * 0.05;    // Reduced from 0.07
  const greenValue = baseGreen - age * 0.045;  // Reduced from 0.06
  const blueValue = baseBlue - age * 0.04;   // Reduced from 0.05
  
  // Higher minimum values to ensure rooms don't get too dark
  const color = {
    r: Math.max(0.50, colorValue),   // Increased from 0.35
    g: Math.max(0.45, greenValue),   // Increased from 0.30
    b: Math.max(0.40, blueValue)     // Increased from 0.20
  };
  
  // Less darkening for floor
  const floorColor = {
    r: color.r * 0.9,  // Increased from 0.8
    g: color.g * 0.9,  // Increased from 0.8
    b: color.b * 0.9   // Increased from 0.8
  };

  // Create extruded shape for walls
  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: false
  };
  
  // Generate a seed based on parameters to ensure consistent textures
  const wallSeed = (vertices.length * 0.13 + height * 0.37 + age * 1.27) % 10;
  const floorSeed = (vertices.length * 0.23 + height * 0.17 + age * 2.31) % 10;
  
  // Use our custom hook to create the materials with more subtle parameters
  const wallMaterial = useProceduralMaterial({
    // Reduced scale for larger, less busy pattern
    scale: 0.3 + age * 0.2,          // Reduced from 0.5 + age * 0.5
    
    // Reduced complexity for less detailed noise
    complexity: 0.8 + age * 0.2,     // Reduced from 1.2 + age * 0.4
    
    seed: wallSeed,
    colorMode: 4,
    
    lightColor: {
      // Add less white for more subtlety
      r: Math.min(0.95, color.r + 0.05),  // Reduced from +0.1
      g: Math.min(0.95, color.g + 0.05),
      b: Math.min(0.95, color.b + 0.05)
    },
    
    darkColor: {
      // Increase values to reduce contrast between light and dark
      r: color.r * 0.85,    // Increased from 0.75
      g: color.g * 0.85,    // Increased from 0.75
      b: color.b * 0.85     // Increased from 0.75
    },
    
    wireframe,
    side: THREE.DoubleSide
  });
  
  const floorMaterial = useProceduralMaterial({
    // Reduced scale for larger, less busy pattern
    scale: 0.5 + age * 0.1,          // Reduced from 1.0 + age * 0.2
    
    // Reduced complexity for less detailed noise
    complexity: 0.7 + age * 0.2,     // Reduced from 1.0 + age * 0.3
    
    seed: floorSeed,
    colorMode: 4,
    
    lightColor: {
      // Reduced brightening for more subtlety
      r: Math.min(0.95, floorColor.r + 0.04),  // Reduced from +0.08
      g: Math.min(0.95, floorColor.g + 0.04),
      b: Math.min(0.95, floorColor.b + 0.04)
    },
    
    darkColor: {
      // Increase values to reduce contrast
      r: floorColor.r * 0.9,     // Increased from 0.8
      g: floorColor.g * 0.9,     // Increased from 0.8
      b: floorColor.b * 0.9      // Increased from 0.8
    },
    
    wireframe,
    side: THREE.DoubleSide
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Room walls with procedural material */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Room floor with procedural material */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow={receiveShadow}
      >
        <shapeGeometry args={[shape]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default Room;
