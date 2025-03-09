import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Stars } from '@react-three/drei';
import ProceduralCityGenerator from './ProceduralCityGenerator';
import { TEMPLE_STYLES } from './temple/Temple';
import { PLATFORM_STYLES } from './platform/constants';
import { SETTINGS_DEFAULTS } from './utils/constants';
import { Controls } from './ui/Controls';
import DebugLegend from './ui/DebugLegend'; // Import the legend component
import Ground from './components/Ground';
import ControlsToggleIcon from './ui/ControlsToggleIcon';

// Main component with added debug helpers functionality
export const AncientCitySimulation = () => {
  const [seed, setSeed] = useState(SETTINGS_DEFAULTS.seed.default);
  const [complexity, setComplexity] = useState(SETTINGS_DEFAULTS.complexity.default);
  const [heightVariation, setHeightVariation] = useState(SETTINGS_DEFAULTS.heightVariation.default);
  const [courtyardCount, setCourtyardCount] = useState(SETTINGS_DEFAULTS.courtyardCount.default);
  const [courtyardSize, setCourtyardSize] = useState(SETTINGS_DEFAULTS.courtyardSize.default);
  const [courtyardSpacing, setCourtyardSpacing] = useState(SETTINGS_DEFAULTS.courtyardSpacing.default);
  const [platformSeed, setPlatformSeed] = useState(SETTINGS_DEFAULTS.platformSeed.default);
  const [platformSize, setPlatformSize] = useState(SETTINGS_DEFAULTS.platformSize.default);
  const [wireframe, setWireframe] = useState(SETTINGS_DEFAULTS.wireframe.default);
  const [showHelpers, setShowHelpers] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [templeStyle, setTempleStyle] = useState(TEMPLE_STYLES.SIMPLE);
  const [templeSize, setTempleSize] = useState(1.0);
  const [platformStyle, setPlatformStyle] = useState(PLATFORM_STYLES.STANDARD);
  
  const toggleControlsVisibility = () => {
    setControlsVisible(prev => !prev);
  }
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#e0c9a6', position: 'relative' }}>
      <Controls 
        seed={seed}
        setSeed={setSeed}
        complexity={complexity}
        setComplexity={setComplexity}
        heightVariation={heightVariation}
        setHeightVariation={setHeightVariation}
        courtyardCount={courtyardCount}
        setCourtyardCount={setCourtyardCount}
        courtyardSize={courtyardSize}
        setCourtyardSize={setCourtyardSize}
        courtyardSpacing={courtyardSpacing}
        setCourtyardSpacing={setCourtyardSpacing}
        platformSeed={platformSeed}
        setPlatformSeed={setPlatformSeed}
        platformSize={platformSize}
        setPlatformSize={setPlatformSize}
        wireframe={wireframe}
        setWireframe={setWireframe}
        showHelpers={showHelpers} // Pass the new helpers state
        setShowHelpers={setShowHelpers} // Pass the setter for helpers
        isVisible={controlsVisible}
        toggleVisibility={toggleControlsVisibility}
        templeStyle={templeStyle}
        setTempleStyle={setTempleStyle}
        templeSize={templeSize}
        setTempleSize={setTempleSize}
        platformStyle={platformStyle}
        setPlatformStyle={setPlatformStyle}
      />
      
      {/* Add the debug legend component */}
      <DebugLegend visible={showHelpers} />
      
      <ControlsToggleIcon 
        isVisible={controlsVisible}
        toggleVisibility={toggleControlsVisibility}
      />

      <Canvas 
        shadows 
        camera={{ position: [40, 60, 40], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#e0c9a6']} />
        
        <Suspense fallback={null}>
          {/* Lighting setup */}
          <directionalLight 
            position={[20, 40, 20]} 
            intensity={2.5}
            castShadow={true}
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0001}
            shadow-camera-far={150}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
            shadow-camera-near={1}
          />
          
          <directionalLight 
            position={[-20, 20, -15]} 
            intensity={0.4} 
            castShadow={false}
          />
          
          {/* <Ground wireframe={wireframe} /> */}
          
          {/* Pass the showHelpers prop to city generator */}
          <ProceduralCityGenerator 
            key={`city-${seed}-${complexity}-${heightVariation}-${courtyardCount}-${courtyardSize}-${courtyardSpacing}-${platformSeed}-${platformSize}-${wireframe}-${templeStyle}-${templeSize}-${platformStyle}-${showHelpers}`} 
            seed={seed} 
            complexity={complexity}
            heightVariation={heightVariation}
            courtyardCount={courtyardCount}
            courtyardSize={courtyardSize}
            courtyardSpacing={courtyardSpacing}
            platformSeed={platformSeed}
            platformSize={platformSize}
            templeStyle={templeStyle}
            templeSize={templeSize}
            platformStyle={platformStyle}
            wireframe={wireframe}
            enableShadows={true}
            showHelpers={showHelpers} // Pass helpers state to the city generator
          />
          
          <Sky 
            sunPosition={[100, 100, 20]}
            turbidity={1.5}
            rayleigh={0.1}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            azimuth={0.25}
          />
          
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
          <Environment preset="sunset" background={false} />
          
          <OrbitControls 
            target={[0, 0, 0]} 
            minDistance={10}
            maxDistance={200}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AncientCitySimulation;
