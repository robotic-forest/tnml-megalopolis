import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { vertexShader, fragmentShader } from './shaders/basicShader';

/**
 * A plane mesh with procedural shader material
 */
export default function ProceduralPlane({ position = [0, 0, 0], rotation = [0, 0, 0], params }) {
  const meshRef = useRef();
  
  // Create shader material with uniforms
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: params.scale },
        uComplexity: { value: params.complexity },
        uSeed: { value: params.seed },
        uColorMode: { value: params.colorMode },
        uLightColor: { value: new THREE.Vector3(
          params.lightColor?.r || 0.93, 
          params.lightColor?.g || 0.82, 
          params.lightColor?.b || 0.6
        )},
        uDarkColor: { value: new THREE.Vector3(
          params.darkColor?.r || 0.54,
          params.darkColor?.g || 0.47,
          params.darkColor?.b || 0.31
        )}
      },
      side: THREE.DoubleSide // Show texture from both sides
    });
  }, []);
  
  // Update shader uniforms when params change
  React.useEffect(() => {
    shaderMaterial.uniforms.uScale.value = Number(params.scale);
    shaderMaterial.uniforms.uComplexity.value = Number(params.complexity);
    shaderMaterial.uniforms.uSeed.value = Number(params.seed);
    shaderMaterial.uniforms.uColorMode.value = Number(params.colorMode);
    
    // Update light color uniform
    if (params.lightColor) {
      shaderMaterial.uniforms.uLightColor.value.set(
        params.lightColor.r, 
        params.lightColor.g, 
        params.lightColor.b
      );
    }
    
    // Update dark color uniform
    if (params.darkColor) {
      shaderMaterial.uniforms.uDarkColor.value.set(
        params.darkColor.r,
        params.darkColor.g,
        params.darkColor.b
      );
    }
  }, [params, shaderMaterial.uniforms]);
  
  // Update time uniform on each frame
  useFrame((state) => {
    if (meshRef.current) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[10, 10, 128, 128]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
