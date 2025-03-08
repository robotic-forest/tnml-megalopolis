import React, { useMemo } from 'react';
import * as THREE from 'three';

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
  
  // Brighter base colors for better visibility
  const baseRed = 0.85;    // Increased from 0.78
  const baseGreen = 0.75;  // Increased from 0.68
  const baseBlue = 0.55;   // Increased from 0.48
  
  // Apply age-based darkening while maintaining beige tone
  const colorValue = baseRed - age * 0.07;  // Reduced darkening effect
  const greenValue = baseGreen - age * 0.06;
  const blueValue = baseBlue - age * 0.05;
  
  // Ensure colors don't get too dark with age
  const color = new THREE.Color(
    Math.max(0.35, colorValue),  // Increased minimum values
    Math.max(0.30, greenValue),
    Math.max(0.20, blueValue)
  );

  // Create extruded shape for walls
  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: false
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Room walls */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8} // Reduced from 1.0
          metalness={0.05} // Added slight metalness
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Room floor - slightly darker shade of the wall color */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow={receiveShadow}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={color.clone().multiplyScalar(0.8)}  // Less darkening (0.8 vs 0.75)
          roughness={0.8} 
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

export default Room;
