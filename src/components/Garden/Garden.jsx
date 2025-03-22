import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sky, Sparkles, PerformanceMonitor, Html } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { EldritchPlants } from './EldritchPlants';
import { FantasticalCreatures } from './FantasticalCreatures';
import { ObjectsOfPower } from './ObjectsOfPower';
import { HiddenPlaces } from './HiddenPlaces';
import { GardenGround } from './GardenGround';
import { Fog, Vector3 } from 'three';

const Scene = () => {
  const sceneRef = useRef();
  
  useFrame(({ scene }) => {
    if (!sceneRef.current) {
      sceneRef.current = true;
      scene.fog = new Fog('#030210', 1, 25);
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={0.3} 
        color="#a080ff" 
        castShadow 
      />
      <pointLight position={[-5, 2, -10]} intensity={0.5} color="#80ffea" />
      <Sparkles count={200} scale={20} size={4} speed={0.3} color="#80a0ff" />
      
      <Physics>
        <GardenGround />
        <EldritchPlants />
        <FantasticalCreatures />
        <ObjectsOfPower />
        <HiddenPlaces />
      </Physics>
      
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
    </>
  );
};

export const Garden = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 75 }}>
        <PerformanceMonitor>
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              maxDistance={20}
              minDistance={1}
            />
            <Sky 
              distance={450000}
              sunPosition={[0, -1, 0]}
              inclination={0.15}
              azimuth={0.25}
              rayleigh={3}
              turbidity={10}
            />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
};