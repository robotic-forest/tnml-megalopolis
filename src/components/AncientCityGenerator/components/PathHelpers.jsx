import React from 'react';
import * as THREE from 'three';

/**
 * Debug visualization for paths and connections
 */
const PathHelpers = ({ 
  path, 
  visible = false
}) => {
  if (!visible || !path.points || path.points.length < 2) return null;

  // Get path points
  const points = path.points.map(p => new THREE.Vector3(p.x, 0.05, p.z));

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ffff00" linewidth={2} />
    </line>
  );
};

export default PathHelpers;
