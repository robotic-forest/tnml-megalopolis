import React from 'react';

/**
 * Simplified house component - just a placeholder box
 */
const SimpleHouse = ({ 
  position, width, length, height, rotation = 0,
  wireframe = false, castShadow = true, receiveShadow = true
}) => {
  return (
    <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
      {/* Simple placeholder box */}
      <mesh 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial 
          color="#c0a080" 
          roughness={0.7}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

export default SimpleHouse;
