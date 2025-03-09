import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ProceduralPlane from './ProceduralPlane';
import ShaderControls from './ui/ShaderControls';

/**
 * Workspace for experimenting with procedural texture generation
 */
export default function ProceduralTexturesWorkspace() {
  // Default color values for light and dark areas
  const defaultLightColor = { r: 0.93, g: 0.82, b: 0.6 }; // Sandy beige for lighter areas
  const defaultDarkColor = { r: 0.54, g: 0.47, b: 0.31 }; // Darker beige for darker areas
  
  // Shader parameters state with dual color control
  const [shaderParams, setShaderParams] = useState({
    scale: 3.0,
    complexity: 1.0,
    seed: 1.42,
    colorMode: 4, // Default to custom color mode
    lightColor: defaultLightColor, // For lighter parts of the texture
    darkColor: defaultDarkColor    // For darker parts of the texture
  });

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#101010']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        
        <ProceduralPlane 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]}
          params={shaderParams}
        />
        
        <OrbitControls />
      </Canvas>
      
      <ShaderControls 
        params={shaderParams}
        setParams={setShaderParams}
      />
    </div>
  );
}
