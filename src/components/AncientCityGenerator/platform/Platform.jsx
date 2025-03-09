import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PLATFORM_STYLES } from './constants';
import { generateStandardPlatformGeometry, generateSteppedPlatformGeometry } from './PlatformGeometry';

// Import Temple component from the correct path
import Temple from '../temple/Temple';

// Function to create procedural texture for platform
const generateProceduralTexture = (resolution = 512, seed = 12345, style = PLATFORM_STYLES.STANDARD) => {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  
  // Create base color based on style
  const baseColor = style === PLATFORM_STYLES.STEPPED ? '#c5b07a' : '#b5a06a';
  
  // Fill background
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, resolution, resolution);
  
  // Use seed to create deterministic random
  const seededRandom = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  // Create stone pattern
  const drawStonePattern = () => {
    let random = seededRandom(seed);
    
    // Create cracks and variations
    for (let i = 0; i < 100 + random * 50; i++) {
      const x = Math.floor(seededRandom(seed + i * 3) * resolution);
      const y = Math.floor(seededRandom(seed + i * 7) * resolution);
      const size = 3 + Math.floor(seededRandom(seed + i) * 10);
      
      // Vary colors slightly for stone texture
      const colorVariation = seededRandom(seed + i * 13) * 40 - 20;
      const r = parseInt(baseColor.substr(1, 2), 16) + colorVariation;
      const g = parseInt(baseColor.substr(3, 2), 16) + colorVariation;
      const b = parseInt(baseColor.substr(5, 2), 16) + colorVariation;
      
      ctx.fillStyle = `rgb(${Math.min(255, Math.max(0, r))}, ${Math.min(255, Math.max(0, g))}, ${Math.min(255, Math.max(0, b))})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Add some noise
    for (let x = 0; x < resolution; x += 4) {
      for (let y = 0; y < resolution; y += 4) {
        if (seededRandom(seed + x * y) > 0.92) {
          const intensity = seededRandom(seed + x + y) * 40 - 20;
          ctx.fillStyle = `rgba(0, 0, 0, ${seededRandom(seed + x - y) * 0.2})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Add stone-like cracks for stepped platforms
    if (style === PLATFORM_STYLES.STEPPED) {
      for (let i = 0; i < 15; i++) {
        const startX = seededRandom(seed + i * 33) * resolution;
        const startY = seededRandom(seed + i * 77) * resolution;
        const length = 30 + seededRandom(seed + i * 5) * 100;
        const angle = seededRandom(seed + i * 9) * Math.PI * 2;
        
        ctx.strokeStyle = `rgba(60, 50, 40, 0.3)`;
        ctx.lineWidth = 1 + seededRandom(seed + i) * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    }
  };
  
  drawStonePattern();
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  return texture;
};

// Function to generate normal map from diffuse texture
const generateNormalMap = (diffuseTexture, strength = 0.5) => {
  const normalMap = new THREE.TextureLoader().load(diffuseTexture.image.toDataURL());
  // This is a simplified approach - ideally you'd compute actual normals from height variations
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4);
  return normalMap;
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
  textureResolution = 512,
  textureScale = 4.0,
  textureStrength = 0.8,
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
  
  // Generate procedural textures based on platform style and seed
  const proceduralTextures = useMemo(() => {
    const diffuseMap = generateProceduralTexture(textureResolution, platformSeed, platformStyle);
    diffuseMap.repeat.set(textureScale, textureScale);
    
    // Generate basic roughness map based on diffuse texture
    const roughnessMap = generateProceduralTexture(textureResolution, platformSeed + 100, platformStyle);
    roughnessMap.repeat.set(textureScale, textureScale);
    
    return {
      diffuseMap,
      roughnessMap
    };
  }, [platformSeed, platformStyle, textureResolution, textureScale]);

  // Get platform color based on style (now just used as base tint for textures)
  const getPlatformColor = () => {
    switch (platformStyle) {
      case PLATFORM_STYLES.STEPPED:
        return "#c5b07a";
      default:
        return "#b5a06a"; // Standard
    }
  };

  // Create material with procedural textures
  const platformMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: getPlatformColor(),
      roughness: 0.95,
      metalness: 0.05,
      map: proceduralTextures.diffuseMap,
      roughnessMap: proceduralTextures.roughnessMap,
      bumpMap: proceduralTextures.diffuseMap,
      bumpScale: textureStrength * 0.05,
      emissive: new THREE.Color(getPlatformColor()).multiplyScalar(0.15),
      side: THREE.DoubleSide,
      wireframe: wireframe,
    });
  }, [proceduralTextures, getPlatformColor, textureStrength, wireframe]);

  // Create material for stepped platforms with more pronounced texturing
  const steppedPlatformMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: getPlatformColor(),
      roughness: 0.95,
      metalness: 0.05,
      map: proceduralTextures.diffuseMap,
      roughnessMap: proceduralTextures.roughnessMap,
      bumpMap: proceduralTextures.diffuseMap,
      bumpScale: textureStrength * 0.08,
      emissive: new THREE.Color(getPlatformColor()),
      emissiveIntensity: 0.3,
      flatShading: true,
      side: THREE.DoubleSide,
      wireframe: wireframe,
    });
  }, [proceduralTextures, getPlatformColor, textureStrength, wireframe]);

  return (
    <group>
      {platformStyle === PLATFORM_STYLES.STANDARD && standardPlatformGeometries && (
        <>
          {/* Standard platform: First tier with shadows disabled */}
          <mesh 
            geometry={standardPlatformGeometries.tier1Geometry} 
            castShadow={false}
            receiveShadow={false}
            material={platformMaterial}
          />
          
          {/* Standard platform: Second tier with shadows disabled */}
          <mesh 
            geometry={standardPlatformGeometries.tier2Geometry} 
            castShadow={false}
            receiveShadow={false}
            material={platformMaterial}
          />
        </>
      )}

      {platformStyle === PLATFORM_STYLES.STEPPED && steppedPlatformGeometry && (
        <>
          {/* Stepped platform: multiple stacked tiers with procedural textures */}
          {steppedPlatformGeometry.map((geometry, index) => (
            <mesh 
              key={`step-${index}`}
              geometry={geometry}
              castShadow={false}
              receiveShadow={false}
              material={steppedPlatformMaterial}
            />
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
