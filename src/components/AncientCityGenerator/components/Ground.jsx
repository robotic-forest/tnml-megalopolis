import React from 'react';
import * as THREE from 'three';

// Simple flat ground plane with improved material
const Ground = ({ wireframe = false }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[260, 260]} />
      <meshStandardMaterial 
        color="#e0c9a6" // Sandy/earth color
        roughness={0.8}
        metalness={0.05}
        wireframe={wireframe}
      />
    </mesh>
  );
};

export default Ground;
