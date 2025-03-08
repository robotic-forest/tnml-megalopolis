import React, { useMemo } from 'react';
import * as THREE from 'three';

// Export temple styles as constants
export const TEMPLE_STYLES = {
  SIMPLE: 'Simple Temple',
  GROOVED: 'Grooved Temple',
};

// Temple component with different style implementations
const Temple = ({ position, size = 1.0, seed = 12345, style = TEMPLE_STYLES.SIMPLE, wireframe = false }) => {
  // Use memoization to ensure stable temple dimensions
  const templeDimensions = useMemo(() => {
    // Get a seeded random generator for temple properties
    const random = new Math.seedrandom(seed.toString());
    
    // Derive temple dimensions based on seed
    return {
      width: (3 + random() * 1.5) * size,
      depth: (4 + random() * 2) * size, 
      height: (3 + random() * 2) * size
    };
  }, [seed, size]);

  // Simple box temple - unmodified original implementation
  if (style === TEMPLE_STYLES.SIMPLE) {
    return (
      <mesh 
        position={position} 
        receiveShadow
      >
        <boxGeometry args={[templeDimensions.width, templeDimensions.height, templeDimensions.depth]} />
        <meshStandardMaterial 
          color="#d9ca9c" 
          roughness={0.9}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>
    );
  }
  
  // Grooved temple implementation with true vertical grooves
  if (style === TEMPLE_STYLES.GROOVED) {
    // Calculate groove parameters
    const grooveParams = useMemo(() => {
      const random = new Math.seedrandom((seed + 1).toString());
      
      // Groove dimensions - exactly twice as wide as deep
      const grooveDepth = Math.min(templeDimensions.width, templeDimensions.depth) * 0.08;
      const grooveWidth = grooveDepth * 2;
      
      // Number of grooves scales with temple dimensions
      const groovesX = Math.max(3, Math.floor(5 * templeDimensions.width / 5));
      const groovesZ = Math.max(3, Math.floor(5 * templeDimensions.depth / 5));
      
      return {
        depth: grooveDepth,
        width: grooveWidth,
        xCount: groovesX,
        zCount: groovesZ
      };
    }, [seed, templeDimensions]);

    return (
      <group position={position}>
        {!wireframe ? (
          // For non-wireframe rendering, create the temple with grooves
          <>
            {/* Base and top as unbroken plates */}
            <mesh position={[0, -templeDimensions.height/2 + 0.05, 0]}>
              <boxGeometry args={[
                templeDimensions.width, 
                0.1, 
                templeDimensions.depth
              ]} />
              <meshStandardMaterial color="#d9ca9c" roughness={0.9} />
            </mesh>
            
            <mesh position={[0, templeDimensions.height/2 - 0.05, 0]}>
              <boxGeometry args={[
                templeDimensions.width, 
                0.1, 
                templeDimensions.depth
              ]} />
              <meshStandardMaterial color="#d9ca9c" roughness={0.9} />
            </mesh>
            
            {/* Render the four corner pillars */}
            {[
              [-1, -1], // Left front
              [1, -1],  // Right front
              [1, 1],   // Right back
              [-1, 1]   // Left back
            ].map(([xSign, zSign], index) => (
              <mesh 
                key={`corner-${index}`}
                position={[
                  xSign * (templeDimensions.width/2 - grooveParams.depth/2),
                  0,
                  zSign * (templeDimensions.depth/2 - grooveParams.depth/2)
                ]}
              >
                <boxGeometry args={[
                  grooveParams.depth, 
                  templeDimensions.height, 
                  grooveParams.depth
                ]} />
                <meshStandardMaterial color="#d9ca9c" roughness={0.9} />
              </mesh>
            ))}
            
            {/* X-axis walls with grooves (front and back) */}
            {[-1, 1].map((zSign, wallIndex) => {
              const wallZ = zSign * templeDimensions.depth/2;
              const availableWidth = templeDimensions.width - 2 * grooveParams.depth;
              const segmentWidth = availableWidth / (grooveParams.xCount * 2 - 1);
              
              return Array.from({ length: grooveParams.xCount }).map((_, i) => {
                // Skip end pillars which are handled separately
                if (i === 0 || i === grooveParams.xCount - 1) return null;
                
                const xPos = -templeDimensions.width/2 + grooveParams.depth + i * segmentWidth * 2;
                
                return (
                  <mesh 
                    key={`xwall-${wallIndex}-${i}`}
                    position={[xPos, 0, wallZ]}
                  >
                    <boxGeometry args={[
                      segmentWidth, 
                      templeDimensions.height, 
                      grooveParams.depth
                    ]} />
                    <meshStandardMaterial color="#d9ca9c" roughness={0.9} />
                  </mesh>
                );
              });
            })}
            
            {/* Z-axis walls with grooves (left and right) */}
            {[-1, 1].map((xSign, wallIndex) => {
              const wallX = xSign * templeDimensions.width/2;
              const availableDepth = templeDimensions.depth - 2 * grooveParams.depth;
              const segmentDepth = availableDepth / (grooveParams.zCount * 2 - 1);
              
              return Array.from({ length: grooveParams.zCount }).map((_, i) => {
                // Skip end pillars which are handled separately
                if (i === 0 || i === grooveParams.zCount - 1) return null;
                
                const zPos = -templeDimensions.depth/2 + grooveParams.depth + i * segmentDepth * 2;
                
                return (
                  <mesh 
                    key={`zwall-${wallIndex}-${i}`}
                    position={[wallX, 0, zPos]}
                  >
                    <boxGeometry args={[
                      grooveParams.depth, 
                      templeDimensions.height, 
                      segmentDepth
                    ]} />
                    <meshStandardMaterial color="#d9ca9c" roughness={0.9} />
                  </mesh>
                );
              });
            })}
          </>
        ) : (
          // For wireframe mode, render as a simple box
          <mesh>
            <boxGeometry args={[templeDimensions.width, templeDimensions.height, templeDimensions.depth]} />
            <meshStandardMaterial 
              color="#d9ca9c" 
              roughness={0.9}
              metalness={0.1}
              wireframe={true}
            />
          </mesh>
        )}
      </group>
    );
  }
  
  // Default fallback
  return (
    <mesh position={position}>
      <boxGeometry args={[3 * size, 3 * size, 4 * size]} />
      <meshStandardMaterial 
        color="#d9ca9c" 
        roughness={0.9}
        wireframe={wireframe}
      />
    </mesh>
  );
};

export default Temple;
