import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PLATFORM_STYLES } from './constants';
import { generateStandardPlatformGeometry, generateSteppedPlatformGeometry } from './PlatformGeometry';

// Import Temple component from the correct path
import Temple from '../temple/Temple';

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
  // Create standard platform using flat, inclined sides
  const standardPlatformGeometries = useMemo(() => {
    if (platformStyle !== PLATFORM_STYLES.STANDARD) return null;
    
    return generateStandardPlatformGeometry({
      baseVertices, 
      topVertices, 
      height, 
      tier2BaseVertices, 
      tier2TopVertices, 
      tier2Height
    });
  }, [platformStyle, baseVertices, topVertices, height, tier2BaseVertices, tier2TopVertices, tier2Height]);

  // Generate stepped platform by stacking multiple platforms
  const steppedPlatformGeometry = useMemo(() => {
    if (platformStyle !== PLATFORM_STYLES.STEPPED) return null;
    
    return generateSteppedPlatformGeometry({
      baseVertices,
      height,
      tier2Height,
      platformSeed
    });
  }, [platformStyle, platformSeed, baseVertices, height, tier2Height]);

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

  return (
    <group>
      {platformStyle === PLATFORM_STYLES.STANDARD && standardPlatformGeometries && (
        <>
          {/* Standard platform: First tier with shadows edisabled */}
          <mesh 
            geometry={standardPlatformGeometries.tier1Geometry} 
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
                roughness={0.6}
                metalness={0.05}
                emissive={new THREE.Color(getPlatformColor())}
                emissiveIntensity={0.3}
                flatShading={true}
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

      {/* Add the temple on top - keeping shadows for the temple */}
      <Temple 
        position={templePosition} 
        size={templeSize * 0.8}
        seed={platformSeed + 1}
        style={templeStyle}
        wireframe={wireframe}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    </group>
  );
};

export default Platform;
