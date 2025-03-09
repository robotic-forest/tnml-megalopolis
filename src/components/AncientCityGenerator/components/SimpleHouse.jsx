import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useProceduralMaterial } from '../../../components/ProceduralTextures/hooks/useProceduralMaterial';

/**
 * Simplified house component with enhanced procedural textures
 * and occasional courtyard houses
 */
const SimpleHouse = ({ 
  position, width, length, height, rotation = 0, age = 1.0, type,
  wireframe = false, castShadow = true, receiveShadow = true
}) => {
  // For debugging - log houses being placed near center 
  React.useEffect(() => {
    if (Math.abs(position.x) < 15 && Math.abs(position.z) < 15) {
      console.log(`House near center at (${position.x.toFixed(2)}, ${position.z.toFixed(2)}), type: ${type}`);
    }
  }, []);
  
  // Base colors based on house type (converted to RGB)
  const baseColor = useMemo(() => {
    // Default color #c0a080 -> RGB(0.75, 0.63, 0.5)
    let r = 0.75;
    let g = 0.63;
    let b = 0.5;
    
    // Different colors by type for easier visual debugging
    if (type === 'guaranteed') {
      // Bright red #d54c4c -> RGB(0.84, 0.3, 0.3)
      r = 0.84;
      g = 0.3;
      b = 0.3;
    } else if (type === 'large') {
      // Beige #c9b285 -> RGB(0.79, 0.7, 0.52)
      r = 0.79;
      g = 0.7;
      b = 0.52;
    } else if (type === 'medium') {
      // Medium brown #b09975 -> RGB(0.69, 0.6, 0.46)
      r = 0.69;
      g = 0.6;
      b = 0.46;
    } else if (type === 'small') {
      // Darker brown #97805d -> RGB(0.59, 0.5, 0.36)
      r = 0.59;
      g = 0.5;
      b = 0.36;
    } else if (type === 'tiny') {
      // Darkest brown #7a6e54 -> RGB(0.48, 0.43, 0.33)
      r = 0.48;
      g = 0.43;
      b = 0.33;
    }
    
    return { r, g, b };
  }, [type]);
  
  // Generate a consistent seed based on house properties and position
  const seed = useMemo(() => {
    return (
      (width * 1.31) + 
      (height * 2.47) + 
      (length * 0.93) +
      (position.x * 0.21) + 
      (position.z * 0.17) +
      (type === 'guaranteed' ? 5.67 : 0)
    ) % 10;
  }, [width, height, length, position.x, position.z, type]);
  
  // Use provided age if available, otherwise calculate a virtual age factor
  const ageFactor = useMemo(() => {
    return age || Math.abs(Math.sin(position.x * 0.5) * Math.cos(position.z * 0.3)) * 0.7;
  }, [position.x, position.z, age]);
  
  // Determine if this should be a courtyard house (1 in 30 chance)
  // But never make guaranteed houses into courtyard houses
  const hasCourtyardType = useMemo(() => {
    if (type === 'guaranteed') return false; // Never modify guaranteed houses
    
    // Use a hash of the position and type to ensure consistent results
    const hash = Math.abs(
      Math.sin(position.x * 12.9898 + position.z * 78.233 + seed * 43.2123) * 43758.5453
    );
    
    // 1 in 30 chance, but higher probability for larger houses
    const probability = type === 'large' ? 6 : type === 'medium' ? 4 : 1;
    return (hash % 30) < probability;
  }, [position.x, position.z, seed, type]);
  
  // Size multiplier to make houses larger (reduced for courtyard houses)
  // *** THIS IS THE VARIABLE TO CHANGE TO ADJUST COURTYARD HOUSE SIZE ***
  const courtyardSizeMultiplier = 1.4; // Reduced from 2.0 to make courtyard houses smaller
  const sizeMultiplier = hasCourtyardType ? courtyardSizeMultiplier : 1.25;
  
  // Calculate adjusted dimensions
  const adjustedWidth = width * sizeMultiplier;
  const adjustedHeight = height * (hasCourtyardType ? 1.4 : 1.25); // Also slightly reduced height multiplier from 1.5
  const adjustedLength = length * sizeMultiplier;
  
  // Courtyard dimensions (inner space)
  const innerWidth = adjustedWidth * 0.4;
  const innerLength = adjustedLength * 0.4;
  
  // Create a shape with a courtyard (outer square with inner square hole)
  const courtyardShape = useMemo(() => {
    if (!hasCourtyardType) return null;
    
    const shape = new THREE.Shape();
    
    // Outer square
    shape.moveTo(-adjustedWidth/2, -adjustedLength/2);
    shape.lineTo(adjustedWidth/2, -adjustedLength/2);
    shape.lineTo(adjustedWidth/2, adjustedLength/2);
    shape.lineTo(-adjustedWidth/2, adjustedLength/2);
    shape.lineTo(-adjustedWidth/2, -adjustedLength/2);
    
    // Inner square (courtyard hole)
    const hole = new THREE.Path();
    hole.moveTo(-innerWidth/2, -innerLength/2);
    hole.lineTo(innerWidth/2, -innerLength/2);
    hole.lineTo(innerWidth/2, innerLength/2);
    hole.lineTo(-innerWidth/2, innerLength/2);
    hole.lineTo(-innerWidth/2, -innerLength/2);
    
    shape.holes.push(hole);
    
    return shape;
  }, [hasCourtyardType, adjustedWidth, adjustedLength, innerWidth, innerLength]);
  
  // Extrude settings for courtyard house
  const extrudeSettings = {
    depth: adjustedHeight,
    bevelEnabled: false
  };
  
  // Create the procedural material for the house with enhanced detail
  const houseMaterial = useProceduralMaterial({
    // Adjusted scale for better detail - smaller numbers = larger patterns
    scale: type === 'guaranteed' 
      ? 5.8 + ageFactor * 0.2  // Reduced from 2.0 to show more detail
      : hasCourtyardType
        ? 0.5 + ageFactor * 0.3  // Larger scale for courtyard houses
        : 1.4 + (width * 0.05) + ageFactor * 0.1,  // Reduced from 0.8
    
    // Increased complexity for more detail
    complexity: type === 'guaranteed' 
      ? 1.2 + ageFactor * 0.3  // Increased from 0.9
      : hasCourtyardType
        ? 1.1 + ageFactor * 0.3  // More complex for courtyard houses
        : 0.9 + (height * 0.15) + ageFactor * 0.3,  // Increased from 0.7
    
    seed,
    colorMode: 4, // Custom color
    
    lightColor: {
      // Add slightly more contrast for better detail visibility
      r: Math.min(0.95, baseColor.r + 0.09),  // Increased from 0.07
      g: Math.min(0.95, baseColor.g + 0.09),
      b: Math.min(0.95, baseColor.b + 0.09)
    },
    
    darkColor: {
      // Slightly more contrast with dark areas
      r: baseColor.r * 0.75,  // Decreased from 0.8
      g: baseColor.g * 0.75,  // Decreased from 0.8
      b: baseColor.b * 0.75   // Decreased from 0.8
    },
    
    wireframe,
    side: THREE.DoubleSide,
    
    // Custom uniforms to enhance detail
    customUniforms: {
      uDetailStrength: { value: 1.25 },  // Increase detail strength
      uTextureStrength: { value: 1.1 }   // Increase texture intensity
    }
  });

  // Create courtyard floor material with a slightly different color
  const floorMaterial = useProceduralMaterial({
    scale: 3.0 + ageFactor * 0.2,
    complexity: 0.8 + ageFactor * 0.1,
    seed: seed + 1.234, // Different seed for variation
    colorMode: 4,
    lightColor: {
      r: Math.min(0.95, baseColor.r * 0.9 + 0.07),
      g: Math.min(0.95, baseColor.g * 0.9 + 0.07),
      b: Math.min(0.95, baseColor.b * 0.9 + 0.07)
    },
    darkColor: {
      r: baseColor.r * 0.65,
      g: baseColor.g * 0.65,
      b: baseColor.b * 0.65
    },
    wireframe,
    side: THREE.DoubleSide
  });

  // Render courtyard house if applicable
  if (hasCourtyardType) {
    return (
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
        {/* Courtyard house with procedural material */}
        <mesh 
          castShadow={castShadow} 
          receiveShadow={receiveShadow}
          rotation={[-Math.PI/2, 0, 0]}
        >
          <extrudeGeometry args={[courtyardShape, extrudeSettings]} />
          <primitive object={houseMaterial} attach="material" />
        </mesh>
        
        {/* Courtyard floor with slightly different material */}
        <mesh
          position={[0, 0.02, 0]}
          rotation={[-Math.PI/2, 0, 0]}
          receiveShadow={receiveShadow}
        >
          <planeGeometry args={[innerWidth, innerLength]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      </group>
    );
  }
  
  // Regular house for non-courtyard types
  return (
    <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
      {/* Main house box with procedural material - using adjusted dimensions */}
      <mesh 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[adjustedWidth, adjustedHeight, adjustedLength]} />
        <primitive object={houseMaterial} attach="material" />
      </mesh>
      
      {/* Debug shape for guaranteed houses - also with adjusted dimensions */}
      {type === 'guaranteed' && (
        <group>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute 
                attach="attributes-position" 
                array={new Float32Array([
                  -adjustedWidth/2, 0, -adjustedLength/2,
                  adjustedWidth/2, 0, -adjustedLength/2,
                  adjustedWidth/2, 0, -adjustedLength/2,
                  adjustedWidth/2, 0, adjustedLength/2,
                  adjustedWidth/2, 0, adjustedLength/2,
                  -adjustedWidth/2, 0, adjustedLength/2,
                  -adjustedWidth/2, 0, adjustedLength/2,
                  -adjustedWidth/2, 0, -adjustedLength/2
                ])} 
                count={8} 
                itemSize={3} 
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" />
          </lineSegments>
        </group>
      )}
    </group>
  );
};

export default SimpleHouse;
