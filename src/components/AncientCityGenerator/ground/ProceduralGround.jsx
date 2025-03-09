import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

// Texture cache to avoid regenerating textures on every render
const textureCache = new Map();

// Compute cache key based on texture parameters
const getTextureCacheKey = (params) => {
  const {
    seed, resolution, textureScale, 
    groundColor1, groundColor2, groundColor3, dustColor, 
    stoniness, dustiness, rippleIntensity, textureType, subtleness,
    tileScale, useVoronoi, macroScale, terrainFeatures, featureScale, featureIntensity
  } = params;
  
  return `${textureType}_${seed}_${resolution}_${textureScale}_${groundColor1}_${groundColor2}_${groundColor3}_${dustColor}_${stoniness}_${dustiness}_${rippleIntensity}_${subtleness}_${tileScale}_${useVoronoi}_${macroScale}_${terrainFeatures}_${featureScale}_${featureIntensity}`;
};

/**
 * Creates a seamless procedural sand texture for the ground plane
 * Optimized with texture caching and performance considerations
 * Enhanced with techniques to reduce obvious tiling
 */
const ProceduralGround = ({ 
  size = 300, 
  resolution = 1024,
  seed = 12345,
  textureScale = 1,
  groundColor1 = '#e4d5b7', // Light sand
  groundColor2 = '#d1bc91', // Medium sand
  groundColor3 = '#c9b188', // Slightly darker sand
  dustColor = '#e8dcbf',    // Fine dust color
  stoniness = 0.3,          // Reduced stone patterns for sand
  dustiness = 0.6,          // Increased dust for sand texture
  rippleIntensity = 0.3,    // Decreased ripple intensity for subtlety 
  subtleness = 0.7,         // Control texture definition (0-1, higher = more subtle)
  tileScale = 3,            // Reduced from 6 for less obvious tiling
  macroScale = 0.05,        // Scale of large patterns that break tiling
  useVoronoi = true,        // Use voronoi-like patterns to break tiling
  receiveShadows = true,
  wireframe = false,
  performanceMode = true,   // Enable performance optimizations
  // New parameters for additional terrain features
  terrainFeatures = true,   // Enable additional terrain features like cracks and dunes
  featureScale = 1.0,       // Control scale of terrain features
  featureIntensity = 0.6    // Control intensity of terrain features
}) => {
  // References to store textures
  const textureRefs = useRef({
    groundTexture: null,
    normalMap: null,
    roughnessMap: null
  });

  // Lower resolution for performance mode
  const actualResolution = performanceMode ? 512 : resolution;
  
  // Generate or retrieve textures from cache
  const textures = useMemo(() => {
    // Generate seamless noise function
    const createSeamlessNoise = (noise2D) => {
      return (x, y, scale, octaves = 1) => {
        let value = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
          const angleX = (x * frequency * scale) * Math.PI * 2;
          const angleY = (y * frequency * scale) * Math.PI * 2;
          
          const noiseX = Math.cos(angleX);
          const noiseY = Math.sin(angleX);
          const noiseZ = Math.cos(angleY);
          const noiseW = Math.sin(angleY);
          
          const n = noise2D(noiseX * frequency, noiseZ * frequency) * 0.5 + 
                  noise2D(noiseY * frequency, noiseW * frequency) * 0.5;
          
          value += n * amplitude;
          maxValue += amplitude;
          amplitude *= 0.5;
          frequency *= 2.1;
        }
        
        return (value / maxValue) * 0.5 + 0.5;
      };
    };

    // Generate Voronoi-like cellular patterns to break up tiling
    const generateVoronoiPattern = (noise2D, seedOffset = 0) => {
      const cellRng = alea((seed + seedOffset).toString());
      const CELL_COUNT = 24; // Fewer cells for larger features
      
      // Generate random cell centers
      const cells = [];
      for (let i = 0; i < CELL_COUNT; i++) {
        cells.push({
          x: cellRng() * 2 - 1, // -1 to 1
          y: cellRng() * 2 - 1,
          value: cellRng() * 0.5 + 0.25 // Random cell value (0.25-0.75)
        });
      }
      
      return (x, y, scale) => {
        // Map coordinates to -1 to 1 range across the entire ground plane
        const nx = (x - 0.5) * scale;
        const ny = (y - 0.5) * scale;
        
        // Find distance to nearest cell center
        let minDist = 999;
        let secondMinDist = 999;
        let nearestValue = 0;
        
        for (const cell of cells) {
          const dx = cell.x - nx;
          const dy = cell.y - ny;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < minDist) {
            secondMinDist = minDist;
            minDist = dist;
            nearestValue = cell.value;
          } else if (dist < secondMinDist) {
            secondMinDist = dist;
          }
        }
        
        // Smooth transition at cell boundaries
        const ratio = minDist / (minDist + secondMinDist);
        
        // Use noise to distort cell edges
        const distortion = noise2D(nx * 0.5, ny * 0.5) * 0.2;
        
        return nearestValue + (ratio * 0.4) + distortion;
      };
    };
    
    // Generate large-scale gradient noise for global variation
    const generateLargeScaleNoise = (noise2D, scale) => {
      return (x, y) => {
        // Very large scale variation
        const largeScale = scale * 0.015;
        
        // Combine multiple octaves of large scale noise
        const n1 = noise2D(x * largeScale, y * largeScale) * 0.5;
        const n2 = noise2D(x * largeScale * 0.4, y * largeScale * 0.4) * 0.3;
        const n3 = noise2D(x * largeScale * 0.1, y * largeScale * 0.1) * 0.2;
        
        return n1 + n2 + n3 + 0.5; // 0 to 1 range
      };
    };

    // New function to generate terrain features like cracks and small dunes
    const generateTerrainFeature = (noise2D, featureType = 'cracks') => {
      return (x, y, scale) => {
        if (featureType === 'cracks') {
          // Generate crack-like patterns using domain warping
          const warpX = noise2D(x * 0.5, y * 0.5) * 0.2;
          const warpY = noise2D(x * 0.5 + 123.4, y * 0.5 + 567.8) * 0.2;
          
          // Sample noise at warped coordinates
          const n1 = Math.abs(noise2D((x + warpX) * scale * 2, (y + warpY) * scale * 2));
          const n2 = Math.abs(noise2D((x + warpY) * scale * 3 + 432.1, (y + warpX) * scale * 3 + 321.7));
          
          // Create sharp ridges for cracks
          return Math.pow(Math.min(n1, n2), 5) * 2.0;
        } 
        else if (featureType === 'dunes') {
          // Create small dune patterns
          const duneBase = noise2D(x * scale * 0.2, y * scale * 0.2) * 0.5 + 0.5;
          const duneDetail = noise2D(x * scale * 1.2, y * scale * 1.2) * 0.5 + 0.5;
          
          // Mix different frequencies for natural dune shapes
          return Math.pow(duneBase * 0.7 + duneDetail * 0.3, 1.5);
        }
        else {
          // Default: subtle textural variation
          return (noise2D(x * scale * 2, y * scale * 2) * 0.5 + 0.5);
        }
      };
    };

    // Parse colors to RGB once and blend them closer together for subtlety
    const parseColor = (colorString) => {
      const color = new THREE.Color(colorString);
      return { r: color.r * 255, g: color.g * 255, b: color.b * 255 };
    };
    
    // Original colors
    const originalColors = {
      color1: parseColor(groundColor1),
      color2: parseColor(groundColor2),
      color3: parseColor(groundColor3),
      colorDust: parseColor(dustColor)
    };
    
    // Function to blend colors based on value
    const blendColors = (c1, c2, factor) => {
      return {
        r: c1.r * (1 - factor) + c2.r * factor,
        g: c1.g * (1 - factor) + c2.g * factor,
        b: c1.b * (1 - factor) + c2.b * factor
      };
    };
    
    // Make colors more similar based on subtleness parameter
    const blendToAverage = (colorSet, factor) => {
      // Calculate average color
      const avg = {
        r: (colorSet.color1.r + colorSet.color2.r + colorSet.color3.r) / 3,
        g: (colorSet.color1.g + colorSet.color2.g + colorSet.color3.g) / 3,
        b: (colorSet.color1.b + colorSet.color2.b + colorSet.color3.b) / 3
      };
      
      // Blend each color toward the average
      return {
        color1: blendColors(colorSet.color1, avg, factor),
        color2: blendColors(colorSet.color2, avg, factor),
        color3: blendColors(colorSet.color3, avg, factor),
        colorDust: colorSet.colorDust // Keep dust color as is
      };
    };
    
    // Generate more subtle colors by blending them toward the average
    const colors = blendToAverage(originalColors, subtleness * 0.7);

    // Helper to generate or retrieve texture from cache
    const getOrCreateTexture = (params, generator) => {
      const cacheKey = getTextureCacheKey(params);
      
      if (textureCache.has(cacheKey)) {
        return textureCache.get(cacheKey);
      }
      
      const texture = generator();
      textureCache.set(cacheKey, texture);
      
      return texture;
    };
    
    // Initialize random number generators with seed - do this once
    const rng = alea(seed.toString());
    const noise2D = createNoise2D(rng);
    const seamlessNoise = createSeamlessNoise(noise2D);
    
    // Create specialized noise functions for breaking up tiling
    const voronoiPattern = generateVoronoiPattern(noise2D);
    const largeScaleNoise = generateLargeScaleNoise(noise2D, macroScale);
    
    // Color texture parameters
    const colorParams = {
      seed,
      resolution: actualResolution,
      textureScale,
      groundColor1,
      groundColor2,
      groundColor3,
      dustColor,
      stoniness,
      dustiness,
      rippleIntensity,
      subtleness,
      tileScale,
      useVoronoi,
      macroScale,
      terrainFeatures,
      featureScale,
      featureIntensity,
      textureType: 'color'
    };

    const crackPattern = terrainFeatures ? 
        generateTerrainFeature(noise2D, 'cracks') : null;

    // Create ground color texture
    const groundTexture = getOrCreateTexture(colorParams, () => {
      const canvas = document.createElement('canvas');
      canvas.width = actualResolution;
      canvas.height = actualResolution;
      const ctx = canvas.getContext('2d');
      
      // Create ImageData for pixel manipulation
      const imageData = ctx.createImageData(actualResolution, actualResolution);
      const data = imageData.data;
      
      // Generate cracks and dunes features if enabled
      const dunePattern = terrainFeatures ? 
        generateTerrainFeature(noise2D, 'dunes') : null;

      // Generate the sand texture
      for (let y = 0; y < actualResolution; y++) {
        for (let x = 0; x < actualResolution; x++) {
          const index = (y * actualResolution + x) * 4;
          
          // Calculate texture coordinates
          const nx = x / actualResolution;
          const ny = y / actualResolution;
          
          // Use reduced scales for more subtle, larger features
          const duneScale = textureScale * 0.2; // Reduced from 0.3 for larger, more subtle dunes
          const rippleScale = textureScale * (2 - subtleness); // Lower frequency ripples
          
          // Base sand dune pattern (larger scale) - less variation
          const baseDunes = seamlessNoise(nx, ny, duneScale, 1); // Reduced octaves
          
          // Medium ripples with fewer octaves and lower intensity
          const mediumRipples = seamlessNoise(nx, ny, rippleScale, 1) * (1 - subtleness * 0.7);
          
          // Minimal fine ripple details
          const fineRipples = performanceMode ? 0.5 : 
                             seamlessNoise(nx, ny, textureScale * 8, 1) * (1 - subtleness * 0.8);
          
          // Wind-blown pattern effect - more subtle
          const windStrength = 0.15 * (1 - subtleness * 0.5); // Reduced from 0.3
          const windPattern = seamlessNoise(
            nx + windStrength * seamlessNoise(nx, ny, textureScale, 1),
            ny, 
            textureScale * 4, 
            1
          );
          
          // Simplified sand particles - higher frequency but lower amplitude
          const sandParticles = seamlessNoise(nx, ny, textureScale * 25, 1);
          
          // Darker spots - greatly reduced for subtlety
          const spotIntensity = 0.15 * (1 - subtleness * 0.8); // Reduced from 0.3
          const darkSpots = Math.pow(seamlessNoise(nx, ny, textureScale, 2), 8) * spotIntensity;
          
          // Combine patterns with more weight on base dunes for subtlety
          const rippleEffect = (mediumRipples * 0.6 + fineRipples * 0.4) * (1 - subtleness * 0.6);
          const sandEffect = baseDunes * 0.6 + windPattern * 0.3 + rippleEffect * 0.1;
          
          // Apply ripple intensity parameter, but make variation more subtle
          const effectiveRippleIntensity = rippleIntensity * (1 - subtleness * 0.5);
          let finalSandPattern = sandEffect * effectiveRippleIntensity + 
                                  (1 - effectiveRippleIntensity) * 0.5;
          
          // ===== NEW: APPLY ANTI-TILING TECHNIQUES =====
          
          // 1. Add large-scale voronoi pattern influence to break up repetition
          if (useVoronoi) {
            const voronoiEffect = voronoiPattern(nx, ny, 1.0);
            // Blend voronoi pattern subtly into the sand
            finalSandPattern = finalSandPattern * 0.8 + voronoiEffect * 0.2;
          }
          
          // 2. Add large-scale gradient variation across entire ground plane
          const globalVariation = largeScaleNoise(nx, ny);
          // Subtle influence on overall pattern
          finalSandPattern = finalSandPattern * 0.85 + globalVariation * 0.15;
          
          // 3. Apply another layer of large scale noise to color selection
          // This will create large regions of slightly different coloration
          const colorShiftNoise = seamlessNoise(nx * 0.1, ny * 0.1, 0.05, 1);
          const colorShift = colorShiftNoise * 0.2; // Subtle shift between color regions
          
          // ===== END ANTI-TILING TECHNIQUES =====

          // ===== ADD TERRAIN FEATURES =====
          // Fix: Only calculate crackValue if terrain features are enabled and crackPattern exists
          let crackValue = 0;
          if (terrainFeatures && crackPattern) {
            // Calculate crack value first
            crackValue = crackPattern(nx, ny, 1.0 * featureScale) * featureIntensity;
            
            // Cracks appear as darker lines
            if (crackValue > 0.1) {
              const crackDarkening = Math.min(1.0, crackValue * 2) * 0.35;
              finalSandPattern = finalSandPattern * (1.0 - crackDarkening);
            }
            
            // Add dunes with controlled intensity
            const duneValue = dunePattern(nx, ny, 0.7 * featureScale);
            const duneEffect = (duneValue - 0.5) * 0.15 * featureIntensity;
            finalSandPattern = finalSandPattern + duneEffect;
          }
          
          // Cross-blend different tiled scales to further reduce repetition
          const smallerTileNoise = seamlessNoise(nx * 3.7, ny * 3.7, 0.5, 1) * 0.5 + 0.5;
          const largerTileNoise = seamlessNoise(nx * 0.37, ny * 0.37, 0.5, 1) * 0.5 + 0.5;
          
          // Blend three scales of noise for more natural variation
          finalSandPattern = finalSandPattern * 0.75 + 
                             smallerTileNoise * 0.15 + 
                             largerTileNoise * 0.1;
          
          // Reduce the color difference range for more subtle transition
          let finalColor;
          if (finalSandPattern < (0.45 - colorShift)) {
            finalColor = blendColors(colors.color3, colors.color2, 
                        finalSandPattern / (0.45 - colorShift));
          } else if (finalSandPattern < (0.65 + colorShift)) {
            finalColor = blendColors(colors.color2, colors.color1, 
                        (finalSandPattern - (0.45 - colorShift)) / (0.2 + colorShift * 2));
          } else {
            finalColor = colors.color1;
          }
          
          // Add small dark spots for pebbles - reduced intensity
          finalColor = blendColors(finalColor, 
                     { r: 160, g: 145, b: 125 }, // Lighter spots for subtlety 
                     darkSpots * (1 - subtleness * 0.7));
          
          // Add fine sand grain noise - reduced intensity
          const grainIntensity = 0.05 * (1 - subtleness * 0.7); // Reduced from 0.1
          const sandGrains = (sandParticles - 0.5) * grainIntensity;
          finalColor = {
            r: Math.max(0, Math.min(255, finalColor.r + sandGrains * 15)),
            g: Math.max(0, Math.min(255, finalColor.g + sandGrains * 10)),
            b: Math.max(0, Math.min(255, finalColor.b + sandGrains * 5))
          };
          
          // Add dust - reduced effect for subtlety
          const dustEffect = dustiness * (1 - subtleness * 0.5);
          const dustAmount = Math.pow(sandParticles, 2) * dustEffect * 0.5;
          finalColor = blendColors(finalColor, colors.colorDust, dustAmount);
          
          // Apply large-scale color variation based on voronoi patterns
          if (useVoronoi) {
            // Create slight color temperature variations across large areas
            const warmth = voronoiPattern(nx, ny, 0.3) * 0.1 - 0.05; // -0.05 to 0.05
            finalColor = {
              r: Math.max(0, Math.min(255, finalColor.r + warmth * 15)),
              g: Math.max(0, Math.min(255, finalColor.g)),
              b: Math.max(0, Math.min(255, finalColor.b - warmth * 10))
            };
          }

          // Add terrain features to normal maps and roughness as well
          // Fix: Only add crack effects if terrain features are enabled and crackValue was calculated
          if (terrainFeatures && crackValue > 0.05) {
            // Make cracks slightly rougher
            finalColor = blendColors(finalColor, 
                      { r: 120, g: 110, b: 95 }, // Darker color for cracks
                      crackValue * featureIntensity * 0.5);
          }
          
          // Set pixel color
          data[index] = finalColor.r;
          data[index + 1] = finalColor.g;
          data[index + 2] = finalColor.b;
          data[index + 3] = 255; // Alpha
        }
      }
      
      // Put the image data back on the canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(tileScale, tileScale); // Reduced tiling repetitions
      
      return texture;
    });

    // Skip normal map in performance mode or generate at lower quality
    let normalMap = null;
    
    if (!performanceMode) {
      const normalParams = {
        seed: seed + 1,
        resolution: actualResolution,
        textureScale,
        rippleIntensity,
        subtleness,
        tileScale,
        useVoronoi,
        macroScale,
        terrainFeatures,
        featureScale,
        featureIntensity,
        textureType: 'normal'
      };

      normalMap = getOrCreateTexture(normalParams, () => {
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = actualResolution;
        normalCanvas.height = actualResolution;
        const ctx = normalCanvas.getContext('2d');
        
        // Initialize different random number generator for normal map
        const normalRng = alea((seed + 1).toString());
        const normalNoise2D = createNoise2D(normalRng);
        const normalSeamlessNoise = createSeamlessNoise(normalNoise2D);
        
        // Create specialized noise for normal map
        const normalVoronoiPattern = generateVoronoiPattern(normalNoise2D, 10);
        const normalLargeScaleNoise = generateLargeScaleNoise(normalNoise2D, macroScale);
        
        // Create ImageData
        const imageData = ctx.createImageData(actualResolution, actualResolution);
        const data = imageData.data;
        
        // Generate the same terrain features for consistent bumps
        const crackPattern = terrainFeatures ? 
          generateTerrainFeature(normalNoise2D, 'cracks') : null;
        const dunePattern = terrainFeatures ? 
          generateTerrainFeature(normalNoise2D, 'dunes') : null;

        // Generate normal map with anti-tiling features
        for (let y = 0; y < actualResolution; y++) {
          for (let x = 0; x < actualResolution; x++) {
            const index = (y * actualResolution + x) * 4;
            
            // Calculate texture coordinates
            const nx = x / actualResolution;
            const ny = y / actualResolution;
            
            // Sample heights with anti-tiling techniques
            const getHeight = (x, y) => {
              // Base height using normal seamless noise
              const baseDune = normalSeamlessNoise(x, y, textureScale * 0.8, 1) * 0.8;
              const medium = normalSeamlessNoise(x, y, textureScale * 3, 1) * 0.2;
              let height = baseDune + medium * (1 - subtleness * 0.8);
              
              // Add voronoi influence for large-scale height variation
              if (useVoronoi) {
                const voronoiHeight = normalVoronoiPattern(x, y, 0.5) * 0.15;
                height = height * 0.9 + voronoiHeight;
              }
              
              // Add large-scale height gradient
              const largeScaleHeight = normalLargeScaleNoise(x, y) * 0.1;
              height = height * 0.95 + largeScaleHeight;

              // Add terrain features to height calculation
              if (terrainFeatures) {
                const nx = x / actualResolution;
                const ny = y / actualResolution;
                
                // Add cracks to height (as depressions)
                const crackValue = crackPattern(nx, ny, 1.0 * featureScale) * featureIntensity;
                if (crackValue > 0.1) {
                  height -= crackValue * 0.2;
                }
                
                // Add dunes to height
                const duneValue = dunePattern(nx, ny, 0.7 * featureScale);
                height += (duneValue - 0.5) * 0.15 * featureIntensity;
              }
              
              return height;
            };
            
            const delta = 1.0 / actualResolution;
            const h = getHeight(nx, ny);
            const hLeft = getHeight(nx - delta, ny);
            const hRight = getHeight(nx + delta, ny);
            const hUp = getHeight(nx, ny - delta);
            const hDown = getHeight(nx, ny + delta);
            
            // Calculate normal vector components with reduced scale for subtlety
            const scale = 0.2 * rippleIntensity * (1 - subtleness * 0.7);
            const dx = (hRight - hLeft) * scale;
            const dy = (hDown - hUp) * scale;
            const dz = 1.0;
            
            // Normalize and convert to RGB
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Normal map values - closer to neutral for subtlety
            data[index] = Math.floor(((dx / length) * 0.5 + 0.5) * 255);
            data[index + 1] = Math.floor(((dy / length) * 0.5 + 0.5) * 255);
            data[index + 2] = Math.floor((dz / length) * 255);
            data[index + 3] = 255;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const normalTexture = new THREE.CanvasTexture(normalCanvas);
        normalTexture.wrapS = THREE.RepeatWrapping;
        normalTexture.wrapT = THREE.RepeatWrapping;
        normalTexture.repeat.set(tileScale, tileScale);
        
        return normalTexture;
      });
    }

    // Use a simpler roughness map in performance mode or skip it
    let roughnessMap = null;
    
    const roughnessParams = {
      seed: seed + 2,
      resolution: performanceMode ? actualResolution / 2 : actualResolution, // Much lower resolution
      textureScale,
      subtleness,
      tileScale,
      useVoronoi,
      macroScale,
      terrainFeatures,
      featureScale,
      featureIntensity,
      textureType: 'roughness'
    };

    roughnessMap = getOrCreateTexture(roughnessParams, () => {
      const roughCanvas = document.createElement('canvas');
      roughCanvas.width = roughnessParams.resolution;
      roughCanvas.height = roughnessParams.resolution;
      const ctx = roughCanvas.getContext('2d');
      
      // Initialize noise generator
      const roughRng = alea((seed + 2).toString());
      const roughNoise2D = createNoise2D(roughRng);
      const roughSeamlessNoise = createSeamlessNoise(roughNoise2D);
      
      // Create voronoi pattern for roughness
      const roughVoronoiPattern = generateVoronoiPattern(roughNoise2D, 20);
      
      // Create ImageData
      const imageData = ctx.createImageData(roughnessParams.resolution, roughnessParams.resolution);
      const data = imageData.data;
      
      // Generate roughness map with anti-tiling
      for (let y = 0; y < roughnessParams.resolution; y++) {
        for (let x = 0; x < roughnessParams.resolution; x++) {
          const index = (y * roughnessParams.resolution + x) * 4;
          
          // Calculate texture coordinates
          const nx = x / roughnessParams.resolution;
          const ny = y / roughnessParams.resolution;
          
          // Standard roughness calculation
          const baseRoughness = 0.8;
          let roughVariation = roughSeamlessNoise(nx, ny, textureScale * 2, 1) * 0.08 * (1 - subtleness * 0.7);
          
          // Add large-scale roughness variation to break up tiling
          if (useVoronoi) {
            const largeScaleRoughness = roughVoronoiPattern(nx, ny, 0.3) * 0.07 - 0.035;
            roughVariation = roughVariation * 0.85 + largeScaleRoughness;
          }

          // Add terrain features to roughness
          if (terrainFeatures) {
            const nx = x / roughnessParams.resolution;
            const ny = y / roughnessParams.resolution;
            
            // Make cracks rougher
            const crackValue = crackPattern(nx, ny, 1.0 * featureScale) * featureIntensity;
            if (crackValue > 0.1) {
              // Lower value = higher roughness
              roughVariation -= crackValue * 0.15;
            }
          }
          
          // Convert to 0-255 range
          const value = Math.floor((baseRoughness - roughVariation) * 255);
          
          // Set pixel (grayscale)
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
          data[index + 3] = 255;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
      roughnessTexture.wrapS = THREE.RepeatWrapping;
      roughnessTexture.wrapT = THREE.RepeatWrapping;
      roughnessTexture.repeat.set(tileScale, tileScale);
      
      return roughnessTexture;
    });

    // Store references to textures
    textureRefs.current = {
      groundTexture,
      normalMap,
      roughnessMap
    };
    
    return { groundTexture, normalMap, roughnessMap };
  }, [
    // Only depend on properties that actually affect the texture
    seed, 
    actualResolution, 
    textureScale, 
    groundColor1, 
    groundColor2, 
    groundColor3, 
    dustColor, 
    stoniness, 
    dustiness, 
    rippleIntensity,
    subtleness,
    tileScale,
    useVoronoi,
    macroScale,
    terrainFeatures,
    featureScale,
    featureIntensity,
    performanceMode
  ]);

  // Clean up when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      // Limit cache size to prevent memory issues
      if (textureCache.size > 20) {
        // Simple strategy: remove oldest entries
        const keysToDelete = Array.from(textureCache.keys()).slice(0, 10);
        keysToDelete.forEach(key => {
          const texture = textureCache.get(key);
          texture.dispose();
          textureCache.delete(key);
        });
      }
    };
  }, []);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.01, 0]} 
      receiveShadow={receiveShadows}
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        map={textures.groundTexture}
        normalMap={textures.normalMap}
        normalScale={[0.05, 0.05]} // Reduced from 0.15 for more subtle relief
        roughnessMap={textures.roughnessMap}
        roughness={0.82}
        metalness={0.0}
        wireframe={wireframe}
      />
    </mesh>
  );
};

export default ProceduralGround;
