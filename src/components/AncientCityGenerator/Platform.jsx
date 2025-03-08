import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import Temple from './Temple';

// Platform style constants - removed TERRACED
export const PLATFORM_STYLES = {
  STANDARD: 'Standard Platform',
  STEPPED: 'Stepped Platform'
};

// Platform component for rendering the tiered central platform
const Platform = ({ 
  baseVertices, 
  topVertices, 
  height, 
  tier2BaseVertices, 
  tier2TopVertices, 
  tier2Height,
  wireframe = false,
  platformSeed = 12345,
  platformStyle = PLATFORM_STYLES.STANDARD,
  platformSize = 1.0,
  templeStyle = 'Simple Temple',
  templeSize = 1.0,
  castShadow = true, 
  receiveShadow = true 
}) => {
  // Create standard platform using flat, inclined sides - NO BEVELS
  const standardPlatformGeometries = useMemo(() => {
    if (platformStyle !== PLATFORM_STYLES.STANDARD) return null;
    
    // Custom geometry for tier 1 with flat, inclined sides
    const tier1Geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const indices = [];
    
    // Create vertical sides by connecting base and top vertices
    for (let i = 0; i < baseVertices.length; i++) {
      const next = (i + 1) % baseVertices.length;
      
      // Get base and top vertices
      const baseVertex = baseVertices[i];
      const nextBaseVertex = baseVertices[next];
      const topVertex = topVertices[i];
      const nextTopVertex = topVertices[next];
      
      // Calculate vertices for this face
      const v0 = new THREE.Vector3(baseVertex.x, 0, baseVertex.y);
      const v1 = new THREE.Vector3(nextBaseVertex.x, 0, nextBaseVertex.y);
      const v2 = new THREE.Vector3(topVertex.x, height, topVertex.y);
      const v3 = new THREE.Vector3(nextTopVertex.x, height, nextTopVertex.y);
      
      // Calculate face normal
      const edge1 = new THREE.Vector3().subVectors(v1, v0);
      const edge2 = new THREE.Vector3().subVectors(v2, v0);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
      
      // Add the 2 triangles forming this quad face
      const baseIndex = positions.length / 3;
      
      // Add positions
      positions.push(
        v0.x, v0.y, v0.z, // 0: bottom left
        v1.x, v1.y, v1.z, // 1: bottom right
        v2.x, v2.y, v2.z, // 2: top left
        v3.x, v3.y, v3.z  // 3: top right
      );
      
      // Add normals (same normal for all vertices in this flat face)
      normals.push(
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z
      );
      
      // Add indices for the 2 triangles
      indices.push(
        baseIndex, baseIndex + 1, baseIndex + 2, // first triangle
        baseIndex + 1, baseIndex + 3, baseIndex + 2 // second triangle
      );
    }
    
    // Add top face for tier 1
    const tier1TopIndex = positions.length / 3;
    
    // Add top face center
    const topCenter = new THREE.Vector3(0, height, 0);
    positions.push(topCenter.x, topCenter.y, topCenter.z);
    normals.push(0, 1, 0); // Top face normal is straight up
    
    // Add top face vertices
    for (let i = 0; i < topVertices.length; i++) {
      positions.push(topVertices[i].x, height, topVertices[i].y);
      normals.push(0, 1, 0);
    }
    
    // Add triangles for top face
    for (let i = 0; i < topVertices.length; i++) {
      const next = (i + 1) % topVertices.length;
      indices.push(
        tier1TopIndex, // center
        tier1TopIndex + 1 + i, // current vertex
        tier1TopIndex + 1 + next // next vertex
      );
    }
    
    // Same approach for tier 2
    // Custom geometry for tier 2 with flat, inclined sides
    const tier2Geometry = new THREE.BufferGeometry();
    const tier2Positions = [];
    const tier2Normals = [];
    const tier2Indices = [];
    
    // Create vertical sides by connecting base and top vertices
    for (let i = 0; i < tier2BaseVertices.length; i++) {
      const next = (i + 1) % tier2BaseVertices.length;
      
      // Get base and top vertices
      const baseVertex = tier2BaseVertices[i];
      const nextBaseVertex = tier2BaseVertices[next];
      const topVertex = tier2TopVertices[i];
      const nextTopVertex = tier2TopVertices[next];
      
      // Calculate vertices for this face
      const v0 = new THREE.Vector3(baseVertex.x, height, baseVertex.y);
      const v1 = new THREE.Vector3(nextBaseVertex.x, height, nextBaseVertex.y);
      const v2 = new THREE.Vector3(topVertex.x, height + tier2Height, topVertex.y);
      const v3 = new THREE.Vector3(nextTopVertex.x, height + tier2Height, nextTopVertex.y);
      
      // Calculate face normal
      const edge1 = new THREE.Vector3().subVectors(v1, v0);
      const edge2 = new THREE.Vector3().subVectors(v2, v0);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
      
      // Add the 2 triangles forming this quad face
      const baseIndex = tier2Positions.length / 3;
      
      // Add positions
      tier2Positions.push(
        v0.x, v0.y, v0.z, // 0: bottom left
        v1.x, v1.y, v1.z, // 1: bottom right
        v2.x, v2.y, v2.z, // 2: top left
        v3.x, v3.y, v3.z  // 3: top right
      );
      
      // Add normals (same normal for all vertices in this flat face)
      tier2Normals.push(
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z
      );
      
      // Add indices for the 2 triangles
      tier2Indices.push(
        baseIndex, baseIndex + 1, baseIndex + 2, // first triangle
        baseIndex + 1, baseIndex + 3, baseIndex + 2 // second triangle
      );
    }
    
    // Add top face for tier 2
    const totalHeight = height + tier2Height;
    const tier2TopIndex = tier2Positions.length / 3;
    
    // Add top face center
    const tier2TopCenter = new THREE.Vector3(0, totalHeight, 0);
    tier2Positions.push(tier2TopCenter.x, tier2TopCenter.y, tier2TopCenter.z);
    tier2Normals.push(0, 1, 0); // Top face normal is straight up
    
    // Add top face vertices
    for (let i = 0; i < tier2TopVertices.length; i++) {
      tier2Positions.push(tier2TopVertices[i].x, totalHeight, tier2TopVertices[i].y);
      tier2Normals.push(0, 1, 0);
    }
    
    // Add triangles for top face
    for (let i = 0; i < tier2TopVertices.length; i++) {
      const next = (i + 1) % tier2TopVertices.length;
      tier2Indices.push(
        tier2TopIndex, // center
        tier2TopIndex + 1 + i, // current vertex
        tier2TopIndex + 1 + next // next vertex
      );
    }
    
    // Create the geometries
    tier1Geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    tier1Geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    tier1Geometry.setIndex(indices);
    
    tier2Geometry.setAttribute('position', new THREE.Float32BufferAttribute(tier2Positions, 3));
    tier2Geometry.setAttribute('normal', new THREE.Float32BufferAttribute(tier2Normals, 3));
    tier2Geometry.setIndex(tier2Indices);
    
    // Compute vertex normals to ensure smooth shading
    tier1Geometry.computeVertexNormals();
    tier2Geometry.computeVertexNormals();
    
    return {
      tier1Geometry,
      tier2Geometry
    };
  }, [platformStyle, baseVertices, topVertices, height, tier2BaseVertices, tier2TopVertices, tier2Height]);

  // Generate stepped platform by stacking multiple simple platforms on top of each other
  const steppedPlatformGeometry = useMemo(() => {
    if (platformStyle !== PLATFORM_STYLES.STEPPED) return null;
    
    // Create a seeded random generator based on platformSeed
    const random = new Math.seedrandom(platformSeed.toString());
    
    // Define the number of steps and their dimensions
    const stepCount = 3 + Math.floor(random() * 2); // 3-4 steps
    const totalHeight = height + tier2Height; // Use total height including both tiers
    
    // Determine height per step
    const stepHeight = totalHeight / stepCount;
    
    // Array to store all the step geometries
    const stepGeometries = [];
    
    // Generate each step as a complete platform object
    for (let step = 0; step < stepCount; step++) {
      // Calculate the scale for this step
      const stepScale = 1.0 - (step / stepCount) * 0.65; // Scale down as we go up
      
      // Calculate the position (height) for this step
      const stepPosition = step * stepHeight;
      
      // Scale the vertices for this step
      const stepBaseVertices = baseVertices.map(vertex => ({
        x: vertex.x * stepScale,
        y: vertex.y * stepScale
      }));
      
      // For top vertices (smaller to create sloped sides), scale a bit more
      const topScaleFactor = stepScale * 0.9; // 10% smaller for inclined sides
      const stepTopVertices = baseVertices.map(vertex => ({
        x: vertex.x * topScaleFactor,
        y: vertex.y * topScaleFactor
      }));
      
      // Create the step geometry - simple BufferGeometry
      const stepGeometry = new THREE.BufferGeometry();
      const positions = [];
      const normals = [];
      const indices = [];
      
      // 1. Create the side faces (inclined walls)
      for (let i = 0; i < stepBaseVertices.length; i++) {
        const next = (i + 1) % stepBaseVertices.length;
        
        // Get vertices for this face
        const baseVertex = stepBaseVertices[i];
        const nextBaseVertex = stepBaseVertices[next];
        const topVertex = stepTopVertices[i];
        const nextTopVertex = stepTopVertices[next];
        
        // Calculate coordinates in 3D space
        const v0 = new THREE.Vector3(baseVertex.x, stepPosition, baseVertex.y);
        const v1 = new THREE.Vector3(nextBaseVertex.x, stepPosition, nextBaseVertex.y);
        const v2 = new THREE.Vector3(topVertex.x, stepPosition + stepHeight, topVertex.y);
        const v3 = new THREE.Vector3(nextTopVertex.x, stepPosition + stepHeight, nextTopVertex.y);
        
        // Calculate face normal (for proper lighting)
        const edge1 = new THREE.Vector3().subVectors(v1, v0);
        const edge2 = new THREE.Vector3().subVectors(v2, v0);
        const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
        
        // Add vertices to geometry
        const faceBaseIndex = positions.length / 3;
        
        // Add positions
        positions.push(
          v0.x, v0.y, v0.z, // bottom left
          v1.x, v1.y, v1.z, // bottom right
          v2.x, v2.y, v2.z, // top left
          v3.x, v3.y, v3.z  // top right
        );
        
        // Add same normal for all vertices of this face
        for (let n = 0; n < 4; n++) {
          normals.push(normal.x, normal.y, normal.z);
        }
        
        // Add indices for the two triangles forming this quad face
        indices.push(
          faceBaseIndex, faceBaseIndex + 1, faceBaseIndex + 2, // first triangle
          faceBaseIndex + 1, faceBaseIndex + 3, faceBaseIndex + 2 // second triangle
        );
      }
      
      // 2. Add bottom face (only visible for first step)
      if (step === 0) {
        const bottomCenterIndex = positions.length / 3;
        
        // Add center vertex
        positions.push(0, stepPosition, 0);
        normals.push(0, -1, 0); // Bottom normal points down
        
        // Add perimeter vertices for bottom face
        const bottomPerimeterStartIndex = positions.length / 3;
        for (let i = 0; i < stepBaseVertices.length; i++) {
          const vertex = stepBaseVertices[i];
          positions.push(vertex.x, stepPosition, vertex.y);
          normals.push(0, -1, 0);
        }
        
        // Create triangles connecting center to perimeter
        for (let i = 0; i < stepBaseVertices.length; i++) {
          const next = (i + 1) % stepBaseVertices.length;
          indices.push(
            bottomCenterIndex,
            bottomPerimeterStartIndex + i,
            bottomPerimeterStartIndex + next
          );
        }
      }
      
      // 3. Add top face
      const topCenterIndex = positions.length / 3;
      
      // Add center vertex at top
      positions.push(0, stepPosition + stepHeight, 0);
      normals.push(0, 1, 0); // Top normal points up
      
      // Add perimeter vertices for top face
      const topPerimeterStartIndex = positions.length / 3;
      for (let i = 0; i < stepTopVertices.length; i++) {
        const vertex = stepTopVertices[i];
        positions.push(vertex.x, stepPosition + stepHeight, vertex.y);
        normals.push(0, 1, 0);
      }
      
      // Create triangles connecting center to perimeter for top face
      for (let i = 0; i < stepTopVertices.length; i++) {
        const next = (i + 1) % stepTopVertices.length;
        indices.push(
          topCenterIndex,
          topPerimeterStartIndex + i,
          topPerimeterStartIndex + next
        );
      }
      
      // Finalize the geometry
      stepGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      stepGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      stepGeometry.setIndex(indices);
      
      // Add to our collection
      stepGeometries.push(stepGeometry);
    }
    
    return stepGeometries;
  }, [platformStyle, platformSeed, baseVertices, height, tier2Height]);

  // Removed terracedPlatformGeometry useMemo function

  // Memoize temple position
  const templePosition = useMemo(() => {
    const templeY = height + tier2Height;
    return [0, templeY, 0]; // Center of the platform at the appropriate height
  }, [height, tier2Height]);
  
  // Get platform color based on style
  const getPlatformColor = () => {
    switch (platformStyle) {
      case PLATFORM_STYLES.STEPPED:
        return "#c5b07a";
      default:
        return "#b5a06a"; // Standard
    }
  };
  
  // Create a consistent material for all platform parts with improved lighting for flat surfaces
  const platformMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: getPlatformColor(),
      roughness: 0.7, // Reduced from 0.9 for better light reflection
      metalness: 0.05, // Reduced from 0.1 for less darkening
      side: THREE.DoubleSide,
      wireframe: wireframe,
      flatShading: false, // Ensure smooth shading across the platform
      // Add some emissive color to brighten the flat surfaces
      emissive: new THREE.Color(getPlatformColor()).multiplyScalar(0.15), // Subtle emissive component
      // Increase ambient light contribution for flat surfaces
      aoMapIntensity: 0.5
    });
  }, [getPlatformColor, wireframe]);

  // For flat top surfaces specifically - a slightly brighter material
  const topSurfaceMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(getPlatformColor()).convertLinearToSRGB().multiplyScalar(1.1), // Brighter color for tops
      roughness: 0.6, // Lower roughness for better light reflection on flat tops
      metalness: 0.03, // Lower metalness for brighter appearance
      side: THREE.DoubleSide,
      wireframe: wireframe,
      flatShading: false,
      emissive: new THREE.Color(getPlatformColor()).multiplyScalar(0.2) // More emissive for top surfaces
    });
  }, [getPlatformColor, wireframe]);

  // Function to create a special material that brightens a specific geometry
  const createEnhancedMaterial = (geometry) => {
    // Check if this geometry has horizontal faces (based on normals)
    // and apply a special material to brighten them
    const normals = geometry.attributes.normal?.array;
    const positions = geometry.attributes.position?.array;
    
    if (!normals || !positions) return platformMaterial;

    // For stacked platforms, we'll just use the top material
    // which is already brighter
    return platformMaterial;
  };
  
  return (
    <group>
      {platformStyle === PLATFORM_STYLES.STANDARD && standardPlatformGeometries && (
        <>
          {/* Standard platform: First tier with shadows disabled */}
          <mesh 
            geometry={standardPlatformGeometries.tier1Geometry} 
            castShadow={false}
            receiveShadow={false}
          >
            <meshStandardMaterial 
              color={getPlatformColor()}
              roughness={0.7} // Reduced roughness for better lighting
              metalness={0.05} // Less metalness for less darkening
              emissive={new THREE.Color(getPlatformColor()).multiplyScalar(0.15)}
              side={THREE.DoubleSide}
              wireframe={wireframe}
            />
          </mesh>
          
          {/* Standard platform: Second tier with shadows disabled */}
          <mesh 
            geometry={standardPlatformGeometries.tier2Geometry} 
            castShadow={false}
            receiveShadow={false}
          >
            <meshStandardMaterial 
              color={getPlatformColor()}
              roughness={0.7}
              metalness={0.05}
              emissive={new THREE.Color(getPlatformColor()).multiplyScalar(0.15)}
              side={THREE.DoubleSide}
              wireframe={wireframe}
            />
          </mesh>
        </>
      )}

      {platformStyle === PLATFORM_STYLES.STEPPED && steppedPlatformGeometry && (
        <>
          {/* Stepped platform: multiple stacked tiers with much higher emissive values */}
          {steppedPlatformGeometry.map((geometry, index) => (
            <mesh 
              key={`step-${index}`}
              geometry={geometry}
              castShadow={false}
              receiveShadow={false}
            >
              <meshStandardMaterial 
                color={getPlatformColor()}
                roughness={0.6} // Reduced roughness (from 0.7) for better reflectivity
                metalness={0.05}
                emissive={new THREE.Color(getPlatformColor())} // Use full base color as emissive
                emissiveIntensity={0.3} // Much higher emissive intensity (instead of multiplyScalar)
                flatShading={true} // Set to true to force flat shading and avoid normal interpolation
                side={THREE.DoubleSide}
                wireframe={wireframe}
              />
            </mesh>
          ))}

          {/* Add supplemental light source to top surfaces */}
          <pointLight
            position={[0, height + tier2Height * 2, 0]}
            intensity={0.8}
            distance={height * 4}
            decay={2}
            color="#ffffff"
          />
        </>
      )}

      {/* Removed terraced platform rendering code */}

      {/* Add the temple on top - keeping shadows for the temple */}
      <Temple 
        position={templePosition} 
        size={templeSize * 0.8}
        seed={platformSeed + 1}
        style={templeStyle}
        wireframe={wireframe}
        castShadow={castShadow}  // Keep shadows for temple
        receiveShadow={receiveShadow}  // Keep shadows for temple
      />
    </group>
  );
};

// Function to generate an irregular platform with sloped sides and a second tier
export function generateIrregularPlatformWithTiers(centerX, centerZ, random, noise2D, sizeModifier = 1.0) {
  // Platform base dimensions
  const baseWidth = 40 * sizeModifier;
  const baseDepth = 50 * sizeModifier;
  const height = 1.2 + random() * 0.8;
  
  // Top is slightly smaller to create sloped sides
  const topScale = 0.85 + random() * 0.05;
  
  // Create base vertices (bottom of platform)
  const numBasePoints = 16; 
  const baseVertices = [];
  
  for (let i = 0; i < numBasePoints; i++) {
    const angle = (i / numBasePoints) * Math.PI * 2;
    
    // Determine if we're on a "long" or "short" side of the rectangle
    const isLongSide = Math.abs(Math.sin(angle)) > Math.abs(Math.cos(angle));
    
    // Calculate radius based on whether we're on long or short side
    let radius;
    if (isLongSide) {
      radius = baseDepth / 2;
    } else {
      radius = baseWidth / 2;
    }
    
    // Add noise for irregularity
    const noiseValue = noise2D(Math.cos(angle), Math.sin(angle)) * 0.15 + 0.95;
    radius *= noiseValue;
    
    // Calculate vertex position
    const x = centerX + Math.cos(angle) * radius;
    const z = centerZ + Math.sin(angle) * radius;
    
    baseVertices.push({ x, y: z }); // Note: y is used for z in the geometry
  }
  
  // Create top vertices (smaller than base) - ensuring they align properly with base
  const topVertices = baseVertices.map(vertex => {
    // Vector from center to vertex
    const vx = vertex.x - centerX;
    const vz = vertex.y - centerZ; // Note: y is used for z
    
    // Scale down to create the smaller top
    return {
      x: centerX + vx * topScale,
      y: centerZ + vz * topScale // Note: y is used for z
    };
  });
  
  // Create second tier on top
  // The second tier base begins at the top of the first tier
  // Ensure exact matching between tiers by using the exact same vertices
  const tier2BaseVertices = topVertices;
  
  // Second tier scale (compared to first tier top) - fix for alignment
  const tier2TopScale = 0.7 + random() * 0.1; // 70-80% of first tier top
  const tier2Height = 0.6 + random() * 0.4;   // Second tier height
  
  // Create second tier top vertices - maintain proper alignment with base
  const tier2TopVertices = tier2BaseVertices.map(vertex => {
    // Vector from center to vertex - calculate from center to preserve alignment
    const vx = vertex.x - centerX;
    const vz = vertex.y - centerZ;
    
    // Scale down further for second tier top
    return {
      x: centerX + vx * tier2TopScale,
      y: centerZ + vz * tier2TopScale
    };
  });
  
  return {
    baseVertices,
    topVertices,
    height,
    width: baseWidth,
    depth: baseDepth,
    centerX,
    centerZ,
    tier2BaseVertices,
    tier2TopVertices,
    tier2Height
  };
}

export default Platform;
