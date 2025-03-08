import React, { useMemo } from 'react';
import * as THREE from 'three';

const Courtyard = ({ vertices, wireframe = false, receiveShadow = true }) => {
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

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.02, 0]}
      receiveShadow={receiveShadow}
    >
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial 
        color="#c7b985" // Brightened from #b5a06a
        roughness={0.7} // Reduced from 0.9 for better light reflection
        metalness={0.1} // Added slight metalness
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  );
};

export default Courtyard;
