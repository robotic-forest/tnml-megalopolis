import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { vertexShader, fragmentShader } from '../shaders/basicShader';

/**
 * Custom hook to create and manage a procedural material
 * 
 * @param {Object} options - Material configuration options
 * @param {number} options.scale - Scale of the texture pattern
 * @param {number} options.complexity - Complexity level of the texture (affects detail)
 * @param {number} options.seed - Random seed for texture generation
 * @param {number} options.colorMode - Color mode (0-4)
 * @param {Object} options.lightColor - RGB object for light areas
 * @param {Object} options.darkColor - RGB object for dark areas
 * @param {boolean} options.wireframe - Whether to render in wireframe mode
 * @param {number} options.side - THREE.FrontSide, THREE.BackSide, or THREE.DoubleSide
 * @param {Object} options.customUniforms - Additional custom uniforms to add to the shader
 * @returns {THREE.ShaderMaterial} Configured shader material
 */
export function useProceduralMaterial({
  scale = 3.0,
  complexity = 1.5, 
  seed = Math.random() * 10,
  colorMode = 4,
  lightColor = { r: 0.9, g: 0.85, b: 0.75 },
  darkColor = { r: 0.65, g: 0.6, b: 0.5 },
  wireframe = false,
  side = THREE.DoubleSide,
  customUniforms = {}
}) {
  // Create shader material with uniforms
  const material = useMemo(() => {
    const baseUniforms = {
      uTime: { value: 0 },
      uScale: { value: scale },
      uComplexity: { value: complexity },
      uSeed: { value: seed },
      uColorMode: { value: colorMode },
      uLightColor: { 
        value: new THREE.Vector3(
          lightColor.r, 
          lightColor.g, 
          lightColor.b
        )
      },
      uDarkColor: { 
        value: new THREE.Vector3(
          darkColor.r,
          darkColor.g,
          darkColor.b
        )
      }
    };

    // Merge any custom uniforms
    const uniforms = { ...baseUniforms, ...customUniforms };
    
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe,
      side
    });
  }, []);
  
  // Update material parameters when they change
  useEffect(() => {
    material.uniforms.uScale.value = scale;
    material.uniforms.uComplexity.value = complexity;
    material.uniforms.uSeed.value = seed;
    material.uniforms.uColorMode.value = colorMode;
    
    material.uniforms.uLightColor.value.set(
      lightColor.r,
      lightColor.g,
      lightColor.b
    );
    
    material.uniforms.uDarkColor.value.set(
      darkColor.r,
      darkColor.g,
      darkColor.b
    );
    
    material.wireframe = wireframe;
    material.side = side;
    
    // Update any custom uniforms if they've changed
    Object.entries(customUniforms).forEach(([key, value]) => {
      if (material.uniforms[key]) {
        material.uniforms[key].value = value.value;
      }
    });
  }, [
    material, scale, complexity, seed, colorMode,
    lightColor, darkColor, wireframe, side, customUniforms
  ]);
  
  // Update time uniform on each frame
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  
  return material;
}
