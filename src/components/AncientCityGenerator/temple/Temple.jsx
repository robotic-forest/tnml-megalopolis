import React from 'react';

// Keep the temple styles constants for UI compatibility
export const TEMPLE_STYLES = {
  SIMPLE: 'Simple Temple',
  GROOVED: 'Grooved Temple'
};

/**
 * Extremely simplified Temple component - just a placeholder box
 */
const Temple = ({ 
  position = [0, 0, 0],
  style = TEMPLE_STYLES.SIMPLE,  // Style param kept for API compatibility but ignored
  size = 1.0,
  wireframe = false,
  castShadow = true,
  receiveShadow = true
}) => {
  // Base size that scales with the size parameter
  const baseWidth = 8 * size;
  const baseDepth = 8 * size;
  const baseHeight = 6 * size;
  
  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Simple placeholder box */}
      <mesh
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[baseWidth, baseHeight, baseDepth]} />
        <meshStandardMaterial
          color="#c0b090"
          roughness={0.7}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

export default Temple;
