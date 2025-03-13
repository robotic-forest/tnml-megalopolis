import React, { useMemo, useRef, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Convert HexagonalObject to use forwardRef to properly pass refs
const HexagonalObject = forwardRef(({
  height = 0.6,
  topRadius = 1.0,
  bottomRadius = 1.5,
  position = [0, 0, 0],
  color = '#8B0000'
}, ref) => {
  // Create custom geometry for the truncated hexagonal pyramid
  const baseVertices = [];
  const topVertices = [];
  
  // Generate vertices for bottom and top hexagons
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    baseVertices.push(new THREE.Vector3(
      bottomRadius * Math.cos(angle),
      -height / 2,
      bottomRadius * Math.sin(angle)
    ));
    
    topVertices.push(new THREE.Vector3(
      topRadius * Math.cos(angle),
      height / 2,
      topRadius * Math.sin(angle)
    ));
  }
  
  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  
  // Add vertices to array
  baseVertices.forEach(v => vertices.push(v.x, v.y, v.z));
  topVertices.forEach(v => vertices.push(v.x, v.y, v.z));
  
  // Add bottom center and top center vertices
  vertices.push(0, -height/2, 0); // bottom center (12)
  vertices.push(0, height/2, 0);  // top center (13)
  
  // Add bottom face triangles
  for (let i = 0; i < 6; i++) {
    indices.push(12, i, (i + 1) % 6);
  }
  
  // Add top face triangles
  for (let i = 0; i < 6; i++) {
    indices.push(13, 6 + ((i + 1) % 6), 6 + i);
  }
  
  // Add side triangles
  for (let i = 0; i < 6; i++) {
    // First triangle of quad
    indices.push(i, 6 + i, 6 + ((i + 1) % 6));
    // Second triangle of quad
    indices.push(i, 6 + ((i + 1) % 6), (i + 1) % 6);
  }
  
  // Set indices and position attributes
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  // Compute normals for proper lighting
  geometry.computeVertexNormals();
  
  // Darkish red material with flat shading and full roughness (non-metallic)
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1.0, 
    metalness: 0,
    flatShading: true
  });
  
  return (
    <mesh 
      ref={ref} 
      geometry={geometry} 
      material={material}
      position={position}
    />
  );
});

function HexagonalPyramid({ position, scale, rotationOffset = 0, distanceFromCenter = 0 }) {
  const groupRef = useRef();
  const middleGroupRef = useRef();
  const topGroupRef = useRef();
  
  // Animation for rotation and object movement directly manipulating refs
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    // Calculate rotation speed based on distance from center
    // Center pyramids (distance = 0) rotate up to 5x faster than edge pyramids (distance = 1)
    const baseRotationSpeed = 0.002;
    const centerSpeedMultiplier = 5;
    const rotationSpeed = baseRotationSpeed * (centerSpeedMultiplier - (centerSpeedMultiplier - 1) * distanceFromCenter);
    
    // Rotate the entire pyramid with dynamic speed
    // groupRef.current.rotation.y += rotationSpeed;
    
    // Calculate oscillation value differently for each pyramid
    const time = clock.getElapsedTime();
    const oscillation = Math.sin(time * 0.8 + rotationOffset);
    
    // Apply position changes to the group containers
    if (middleGroupRef.current) {
      middleGroupRef.current.position.y = 0.3 + oscillation * 0.18;
    }
    
    if (topGroupRef.current) {
      topGroupRef.current.position.y = 0.6 + oscillation * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Base level - darkest */}
      <HexagonalObject 
        height={0.6} 
        bottomRadius={1.5} 
        topRadius={1.0} 
        position={[0, 0, 0]} 
        color="#8B0000" 
      />
      
      {/* Middle level - medium - animated - wrap in a group */}
      <group ref={middleGroupRef} position={[0, 0.5, 0]}>
        <HexagonalObject 
          height={0.6} 
          bottomRadius={0.9} 
          topRadius={0.65} 
          position={[0, 0, 0]} 
          color="#A52A2A" 
        />
      </group>
      
      {/* Top level - lightest - animated - wrap in a group */}
      <group ref={topGroupRef} position={[0, 0.8, 0]}>
        <HexagonalObject 
          height={0.4} 
          bottomRadius={0.6} 
          topRadius={0.4} 
          position={[0, 0, 0]}  
          color="#CD5C5C" 
        />
      </group>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial 
        color="#000000" 
        side={THREE.DoubleSide} 
        roughness={0.8}
      />
    </mesh>
  );
}

function HexagonalField() {
  // Parameters to control the size distribution
  const centerScale = 1.0;    // Maximum scale at the center
  const edgeScale = 0.15;     // Minimum scale at the edges
  const falloffExponent = 1.8; // Controls how quickly the scale falls off from center to edge
  
  // Generate pyramid positions in a grid
  const pyramids = useMemo(() => {
    const items = [];
    const gridSize = 10; // 10x10 grid = 100 pyramids
    const spacing = 4; // distance between pyramids
    
    // Calculate max distance from center (for normalization)
    const maxDistance = Math.sqrt(2) * ((gridSize - 1) / 2) * spacing;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Calculate position in grid, centered around origin
        const xPos = (x - (gridSize - 1) / 2) * spacing;
        const zPos = (z - (gridSize - 1) / 2) * spacing;
        
        // Calculate distance from center (normalized 0-1)
        const distance = Math.sqrt(xPos * xPos + zPos * zPos) / maxDistance;
        
        // Calculate scale based on distance from center
        // Using a power function to control the falloff
        const distanceFactor = Math.pow(distance, falloffExponent);
        const pyramidScale = centerScale - (centerScale - edgeScale) * distanceFactor;
        
        // Add a small random variation (±10%)
        const randomVariation = 1 + (Math.random() * 0.2 - 0.1);
        const finalScale = pyramidScale * randomVariation;
        
        // Calculate the y position - aligning the bottom to the ground plane
        const yPos = 0.3 * finalScale;
        
        // Add a random rotation offset for varied animation
        const rotOffset = Math.random() * Math.PI * 2;
        
        items.push({
          position: [xPos, yPos, zPos],
          scale: finalScale,
          rotationOffset: rotOffset,
          distanceFromCenter: distance, // Pass the normalized distance to control rotation speed
          id: `pyramid-${x}-${z}`
        });
      }
    }
    
    return items;
  }, []);

  return (
    <>
      <Ground />
      {pyramids.map((pyramid) => (
        <HexagonalPyramid 
          key={pyramid.id}
          position={pyramid.position}
          scale={[pyramid.scale, pyramid.scale, pyramid.scale]}
          rotationOffset={pyramid.rotationOffset}
          distanceFromCenter={pyramid.distanceFromCenter}
        />
      ))}
    </>
  );
}

function Extrusions() {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'black' }}>
      <Canvas 
        camera={{ position: [15, 15, 15], fov: 45 }}
        shadows
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <HexagonalField />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          minPolarAngle={Math.PI / 16}  // Prevent looking straight down
          maxPolarAngle={Math.PI / 2.2} // Prevent going below the ground plane
        />
      </Canvas>
    </div>
  );
}

export default Extrusions;
