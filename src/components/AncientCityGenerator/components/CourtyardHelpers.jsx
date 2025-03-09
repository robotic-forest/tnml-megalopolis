import React from 'react';
import * as THREE from 'three';

/**
 * Debug visualization for courtyard placement, rings, and room zones
 */
const CourtyardHelpers = ({ 
  courtyard, 
  visible = false
}) => {
  if (!visible) return null;

  const center = courtyard.position;
  const vertices = courtyard.vertices;
  const radius = courtyard.radius;

  // Create arrays for line display
  const createRing = (ringRadius, segments = 64) => {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * ringRadius;
      const z = center.z + Math.sin(angle) * ringRadius;
      points.push(new THREE.Vector3(x, 0.05, z));
    }
    return points;
  };

  // Generate courtyard polygon points
  const polygonPoints = [];
  if (vertices && vertices.length > 0) {
    vertices.forEach((vertex) => {
      polygonPoints.push(new THREE.Vector3(vertex.x, 0.05, vertex.y));
    });
    // Close the loop
    polygonPoints.push(new THREE.Vector3(vertices[0].x, 0.05, vertices[0].y));
  }

  // Create rings
  const innerRingPoints = createRing(radius * 1.2);  // Inner houses ring
  const middleRingPoints = createRing(radius * 2.1); // Middle houses ring
  const outerRingPoints = createRing(radius * 3.0);  // Outer houses ring
  const roomRingPoints = createRing(radius + 1.5);   // Room placement ring

  return (
    <group>
      {/* Courtyard center */}
      <mesh position={[center.x, 0.05, center.z]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Courtyard boundary */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(polygonPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={polygonPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff9900" linewidth={2} />
      </line>

      {/* Room placement zone */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(roomRingPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={roomRingPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff00" linewidth={2} />
      </line>

      {/* Inner houses ring */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(innerRingPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={innerRingPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0088ff" linewidth={2} />
      </line>

      {/* Middle houses ring */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(middleRingPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={middleRingPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#5500ff" linewidth={2} />
      </line>

      {/* Outer houses ring */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(outerRingPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={outerRingPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#aa00ff" linewidth={2} />
      </line>
    </group>
  );
};

export default CourtyardHelpers;
