import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';
import { Color, DataTexture, RGBAFormat, RepeatWrapping, Vector2 } from 'three';

export const GardenGround = () => {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.1, 0],
    type: 'static'
  }));
  
  const groundRef = useRef();
  const [textures, setTextures] = useState(null);
  
  // Create procedural textures
  useEffect(() => {
    // Create diffuse texture
    const createDiffuseTexture = () => {
      const size = 256;
      const data = new Uint8Array(4 * size * size);
      
      const baseColor = [37, 6, 49]; // #250631 RGB values
      const secondaryColor = [56, 9, 82]; // #380952 RGB values
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = (i * size + j) * 4;
          
          // Random noise to create a mottled effect
          const noiseFactor = Math.random() * 0.3;
          
          // Mix between base and secondary color based on noise
          data[index] = Math.floor(baseColor[0] * (1 - noiseFactor) + secondaryColor[0] * noiseFactor);
          data[index + 1] = Math.floor(baseColor[1] * (1 - noiseFactor) + secondaryColor[1] * noiseFactor);
          data[index + 2] = Math.floor(baseColor[2] * (1 - noiseFactor) + secondaryColor[2] * noiseFactor);
          data[index + 3] = 255; // Alpha channel
          
          // Add some "veins" for an eldritch look
          const distToVein = Math.abs(Math.sin(i / 10) * Math.cos(j / 10) * 5);
          if (distToVein < 0.05) {
            data[index] = 105; // #6922a3 RGB values
            data[index + 1] = 34;
            data[index + 2] = 163;
          }
        }
      }
      
      const texture = new DataTexture(data, size, size, RGBAFormat);
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };
    
    // Create displacement texture
    const createDisplacementTexture = () => {
      const size = 256;
      const data = new Uint8Array(4 * size * size);
      
      // Create a simplex-noise-like pattern
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = (i * size + j) * 4;
          
          // Create noise pattern
          const x = i / size;
          const y = j / size;
          const value = (Math.sin(x * 20) * 0.5 + 0.5) * 
                       (Math.sin(y * 20) * 0.5 + 0.5) * 
                       (Math.sin((x + y) * 10) * 0.5 + 0.5) * 
                       (Math.random() * 0.2 + 0.8);
          
          const pixelValue = Math.floor(value * 255);
          
          data[index] = pixelValue;
          data[index + 1] = pixelValue;
          data[index + 2] = pixelValue;
          data[index + 3] = 255;
        }
      }
      
      const texture = new DataTexture(data, size, size, RGBAFormat);
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };
    
    // Create normal map texture
    const createNormalTexture = () => {
      const size = 256;
      const data = new Uint8Array(4 * size * size);
      
      // Create a simple normal map
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = (i * size + j) * 4;
          
          // Default normal pointing up (in tangent space)
          let nx = 128;
          let ny = 128;
          let nz = 255;
          
          // Add some variation
          const angle = Math.random() * Math.PI * 2;
          const strength = Math.random() * 0.2;
          nx = Math.floor(128 + Math.cos(angle) * strength * 128);
          ny = Math.floor(128 + Math.sin(angle) * strength * 128);
          
          data[index] = nx;
          data[index + 1] = ny;
          data[index + 2] = nz;
          data[index + 3] = 255;
        }
      }
      
      const texture = new DataTexture(data, size, size, RGBAFormat);
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };
    
    // Generate all procedural textures
    const proceduralTextures = {
      map: createDiffuseTexture(),
      displacementMap: createDisplacementTexture(),
      normalMap: createNormalTexture(),
      displacementScale: 0.2,
      color: new Color('#250631'),
      roughness: 0.8,
      metalness: 0.1
    };
    
    setTextures(proceduralTextures);
  }, []);
  
  useFrame(({ clock }) => {
    if (groundRef.current) {
      const elapsedTime = clock.getElapsedTime();
      // Subtle pulsing effect for the ground
      if (textures && textures.displacementMap) {
        groundRef.current.displacementScale = 0.2 + Math.sin(elapsedTime * 0.3) * 0.05;
      }
      
      // Add subtle color pulse
      if (groundRef.current.color) {
        const baseColor = new Color('#250631');
        const pulseColor = new Color('#380952');
        const mixFactor = (Math.sin(elapsedTime * 0.3) + 1) / 2 * 0.3;
        groundRef.current.color.copy(baseColor).lerp(pulseColor, mixFactor);
      }
    }
  });
  
  if (!textures) {
    return null; // Don't render until procedural textures are generated
  }
  
  return (
    <mesh ref={ref} receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <meshStandardMaterial
        ref={groundRef}
        {...textures}
      />
    </mesh>
  );
};
