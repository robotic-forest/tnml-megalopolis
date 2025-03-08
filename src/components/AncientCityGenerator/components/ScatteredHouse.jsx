import React from 'react';

/**
 * Simplified scattered house with courtyard - now just a placeholder box
 */
const ScatteredHouse = ({ 
  vertices, height, width, length, rotation = 0, center,
  wireframe = false, castShadow = true, receiveShadow = true 
}) => {
  // Calculate position from center
  const position = center ? { x: center.x, z: center.y } : { x: 0, z: 0 };

  return (
    <group position={[position.x, 0, position.z]} rotation={[0, rotation || 0, 0]}>
      {/* Simple placeholder box */}
      <mesh 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[width || 2, height || 1, length || 2]} />
        <meshStandardMaterial 
          color="#b09070" 
          roughness={0.7}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

export default ScatteredHouse;
