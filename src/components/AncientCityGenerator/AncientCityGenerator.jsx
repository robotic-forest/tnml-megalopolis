import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ProceduralCityGenerator, { SETTINGS_DEFAULTS } from './ProceduralCityGenerator';
import { TEMPLE_STYLES } from './Temple';
import { PLATFORM_STYLES } from './Platform';

// Simple flat ground plane with increased size and improved material
const Ground = ({ wireframe = false }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[260, 260]} />
      <meshStandardMaterial 
        color="#e0c9a6" // Sandy/earth color
        roughness={0.8} // Reduced roughness for better light reflection
        metalness={0.05} // Slight metalness for better highlights
        wireframe={wireframe}
      />
    </mesh>
  );
};

// A square button with unicode icon to replace the Controls Toggle Button
const ControlsToggleIcon = ({ isVisible, toggleVisibility }) => {
  return (
    <button 
      onClick={toggleVisibility}
      css={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '28px',
        height: '28px',
        background: '#e0c9a6',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        border: '2px outset #d0c0a0',
        borderRadius: '0',
        cursor: 'pointer',
        zIndex: 100,
        fontFamily: 'monospace',
        '&:hover': {
          background: '#e8d7be'
        }
      }}
      title={isVisible ? "Hide Controls" : "Show Controls"}
    >
      <span className='relative top-[-0.5px]'>{isVisible ? "☰" : "⚙"}</span>
    </button>
  );
};

// UI Controls component with updated styling
const Controls = ({ 
  seed, setSeed, 
  complexity, setComplexity, 
  heightVariation, setHeightVariation,
  courtyardCount, setCourtyardCount,
  courtyardSize, setCourtyardSize,
  courtyardSpacing, setCourtyardSpacing,
  platformSeed, setPlatformSeed,
  platformSize, setPlatformSize,
  scatteredHouseDensity, setScatteredHouseDensity,
  scatteredHouseRadius, setScatteredHouseRadius,
  wireframe, setWireframe,
  isVisible, // New visibility prop
  toggleVisibility,
  templeStyle, setTempleStyle,
  templeSize, setTempleSize,
  platformStyle, setPlatformStyle // New platform style props
}) => {
  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * SETTINGS_DEFAULTS.seed.max));
  };

  const randomizePlatformSeed = () => {
    setPlatformSeed(Math.floor(Math.random() * SETTINGS_DEFAULTS.platformSeed.max));
  };

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div style={{
      position: 'absolute',
      top: '6px',
      right: '6px',
      padding: '1rem',
      background: '#e0c9a6',
      color: '#000000', 
      fontFamily: 'monospace', // Changed to monospace
      zIndex: 100,
      maxHeight: 'calc(100vh - 12px)',
      overflowY: 'auto',
      border: '2px outset #d0c0a0', // Windows 95-style outset border
      borderRadius: '0' // Square corners for Win95 look
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <h4 style={{ margin: '0', fontSize: '16px' }}>Ancient City Generator</h4>
        <button 
          onClick={() => toggleVisibility()}
          css={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e0c9a6',
            border: '2px outset #d0c0a0',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'black',
            padding: 0,
            '&:hover': {
              background: '#e8d7be'
            }
          }}
          title="Hide Controls"
        >
          ✕
        </button>
      </div>
      
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Display Options</h4>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Wireframe Mode
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>
          City Seed: 
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '80px' }}
          />
        </label>
        <button 
          onClick={randomizeSeed}
          css={{
            height: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e0c9a6',
            border: '2px outset #d0c0a0',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'black',
            padding: '0px 4px',
            '&:hover': {
              background: '#e8d7be'
            }
          }}
        >
          Randomize
        </button>
      </div>

      {/* New Platform Controls Section - updated for Win95 style */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Platform Controls</h4>
        <div style={{ marginBottom: '0.5rem' }}>
          <label css={{ marginRight: '0.5rem' }}>
            Platform Seed: 
            <input
              type="number"
              value={platformSeed}
              onChange={(e) => setPlatformSeed(parseInt(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </label>
          <button 
            onClick={randomizePlatformSeed}
            css={{
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#e0c9a6',
              border: '2px outset #d0c0a0',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'black',
              padding: '0px 4px',
              '&:hover': {
                background: '#e8d7be'
              }
            }}
          >
            Randomize
          </button>
        </div>
        <div>
          <label>
            Platform Size:
            <input
              type="range"
              min={SETTINGS_DEFAULTS.platformSize.min}
              max={SETTINGS_DEFAULTS.platformSize.max}
              step={SETTINGS_DEFAULTS.platformSize.step}
              value={platformSize}
              onChange={(e) => setPlatformSize(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {platformSize.toFixed(1)}
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>
            Style:
            <select 
              value={platformStyle}
              onChange={(e) => setPlatformStyle(e.target.value)}
              style={{ 
                marginLeft: '0.5rem',
                background: '#e0c9a6',
                border: '1px inset #c0b090',
                padding: '2px 4px',
                color: '#000000', // Ensure text is black
                appearance: 'auto', // Use browser default dropdown appearance
                WebkitAppearance: 'menulist', // Force standard dropdown on WebKit
                MozAppearance: 'menulist', // Force standard dropdown on Firefox
                fontFamily: 'monospace' // Match other controls font
              }}
            >
              <option value={PLATFORM_STYLES.STANDARD}>{PLATFORM_STYLES.STANDARD}</option>
              <option value={PLATFORM_STYLES.STEPPED}>{PLATFORM_STYLES.STEPPED}</option>
              {/* Removed TERRACED option */}
            </select>
          </label>
        </div>
      </div>

      {/* Scattered Houses Controls Section - updated for Win95 style */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Scattered Houses</h4>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Density:
            <input
              type="range"
              min={SETTINGS_DEFAULTS.scatteredHouseDensity.min}
              max={SETTINGS_DEFAULTS.scatteredHouseDensity.max}
              step={SETTINGS_DEFAULTS.scatteredHouseDensity.step}
              value={scatteredHouseDensity}
              onChange={(e) => setScatteredHouseDensity(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {scatteredHouseDensity.toFixed(1)}
          </label>
        </div>
        <div>
          <label>
            Spread Radius:
            <input
              type="range"
              min={SETTINGS_DEFAULTS.scatteredHouseRadius.min}
              max={SETTINGS_DEFAULTS.scatteredHouseRadius.max}
              step={SETTINGS_DEFAULTS.scatteredHouseRadius.step}
              value={scatteredHouseRadius}
              onChange={(e) => setScatteredHouseRadius(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {scatteredHouseRadius.toFixed(1)}x
          </label>
        </div>
      </div>

      {/* Existing sliders - updated to use settings defaults */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Complexity:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.complexity.min}
            max={SETTINGS_DEFAULTS.complexity.max}
            step={SETTINGS_DEFAULTS.complexity.step}
            value={complexity}
            onChange={(e) => setComplexity(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {complexity.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Height Variation:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.heightVariation.min}
            max={SETTINGS_DEFAULTS.heightVariation.max}
            step={SETTINGS_DEFAULTS.heightVariation.step}
            value={heightVariation}
            onChange={(e) => setHeightVariation(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {heightVariation.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Count:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardCount.min}
            max={SETTINGS_DEFAULTS.courtyardCount.max}
            step={SETTINGS_DEFAULTS.courtyardCount.step}
            value={courtyardCount}
            onChange={(e) => setCourtyardCount(parseInt(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardCount}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Size:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardSize.min}
            max={SETTINGS_DEFAULTS.courtyardSize.max}
            step={SETTINGS_DEFAULTS.courtyardSize.step}
            value={courtyardSize}
            onChange={(e) => setCourtyardSize(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardSize.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Spacing:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardSpacing.min}
            max={SETTINGS_DEFAULTS.courtyardSpacing.max}
            step={SETTINGS_DEFAULTS.courtyardSpacing.step}
            value={courtyardSpacing}
            onChange={(e) => setCourtyardSpacing(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardSpacing.toFixed(1)}
        </label>
      </div>

      {/* New Temple Controls Section - Updated dropdown styling */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Temple Controls</h4>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>
            Style:
            <select 
              value={templeStyle}
              onChange={(e) => setTempleStyle(e.target.value)}
              style={{ 
                marginLeft: '0.5rem',
                background: '#e0c9a6',
                border: '1px inset #c0b090',
                padding: '2px 4px',
                color: '#000000', // Ensure text is black
                appearance: 'auto', // Use browser default dropdown appearance
                WebkitAppearance: 'menulist', // Force standard dropdown on WebKit
                MozAppearance: 'menulist', // Force standard dropdown on Firefox
                fontFamily: 'monospace' // Match other controls font
              }}
            >
              <option value={TEMPLE_STYLES.SIMPLE}>{TEMPLE_STYLES.SIMPLE}</option>
              <option value={TEMPLE_STYLES.GROOVED}>{TEMPLE_STYLES.GROOVED}</option>
              {/* More options can be added here later */}
            </select>
          </label>
        </div>
        
        <div>
          <label>
            Temple Size:
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={templeSize}
              onChange={(e) => setTempleSize(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {templeSize.toFixed(1)}x
          </label>
        </div>
      </div>

      {/* CSS fix for range inputs to vertically align with text and add space between sliders and values */}
      <style>{`
        input[type="range"] {
          vertical-align: middle;
          margin-top: 0;
          margin-bottom: 0;
          margin-right: 0.5rem; /* Add space between slider and value */
        }
      `}</style>
    </div>
  );
};

// Main component - use the new ControlsToggleIcon
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
  const [scatteredHouseDensity, setScatteredHouseDensity] = useState(SETTINGS_DEFAULTS.scatteredHouseDensity.default);
  const [scatteredHouseRadius, setScatteredHouseRadius] = useState(SETTINGS_DEFAULTS.scatteredHouseRadius.default);
  
  // Add state for controls visibility
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const toggleControlsVisibility = () => {
    setControlsVisible(prev => !prev);
  }

  // Add new temple control state variables
  const [templeStyle, setTempleStyle] = useState(TEMPLE_STYLES.SIMPLE);
  const [templeSize, setTempleSize] = useState(1.0);

  // Add new platform control state variables
  const [platformStyle, setPlatformStyle] = useState(PLATFORM_STYLES.STANDARD);
  
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
        scatteredHouseDensity={scatteredHouseDensity}
        setScatteredHouseDensity={setScatteredHouseDensity}
        scatteredHouseRadius={scatteredHouseRadius}
        setScatteredHouseRadius={setScatteredHouseRadius}
        wireframe={wireframe}
        setWireframe={setWireframe}
        isVisible={controlsVisible}
        toggleVisibility={toggleControlsVisibility}
        templeStyle={templeStyle}
        setTempleStyle={setTempleStyle}
        templeSize={templeSize}
        setTempleSize={setTempleSize}
        platformStyle={platformStyle}
        setPlatformStyle={setPlatformStyle}
      />
      
      <ControlsToggleIcon 
        isVisible={controlsVisible}
        toggleVisibility={toggleControlsVisibility}
      />

      <Canvas 
        shadows 
        camera={{ position: [40, 60, 40], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#e0c9a6']} /> {/* Sandy beige background */}
        
        <Suspense fallback={null}>
          {/* Enhanced lighting system */}

          
          {/* Hemisphere light for natural ambient lighting */} */}
          
          {/* Main directional light - improved shadow settings */}
          <directionalLight 
            position={[20, 40, 20]} 
            intensity={2.5}
            castShadow={true}
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0001} // Prevent shadow acne
            shadow-camera-far={150}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
            shadow-camera-near={1}
          />
          
          {/* Secondary fill light from another angle - no shadows for better performance */}
          <directionalLight 
            position={[-20, 20, -15]} 
            intensity={0.4} 
            castShadow={false}
          />
          
          <Ground wireframe={wireframe} />
          
          <ProceduralCityGenerator 
            key={`city-${seed}-${complexity}-${heightVariation}-${courtyardCount}-${courtyardSize}-${courtyardSpacing}-${platformSeed}-${platformSize}-${scatteredHouseDensity}-${scatteredHouseRadius}-${wireframe}-${templeStyle}-${templeSize}-${platformStyle}`} 
            seed={seed} 
            complexity={complexity}
            heightVariation={heightVariation}
            courtyardCount={courtyardCount}
            courtyardSize={courtyardSize}
            courtyardSpacing={courtyardSpacing}
            platformSeed={platformSeed}
            platformSize={platformSize}
            scatteredHouseDensity={scatteredHouseDensity}
            scatteredHouseRadius={scatteredHouseRadius}
            templeStyle={templeStyle}
            templeSize={templeSize}
            platformStyle={platformStyle}
            wireframe={wireframe}
            enableShadows={true} // Add a new prop to control shadow rendering
          />
          
          {/* Optimized sky settings */}
          <Sky 
            sunPosition={[100, 100, 20]} // Moved sun position for better lighting angle
            turbidity={1.5}              // Reduced from 2.5 for clearer, brighter sky
            rayleigh={0.1}               // Adjusted rayleigh for better sky blue
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            azimuth={0.25}
          />
          
          {/* Add subtle stars for visual interest */}
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
        
          
          {/* Add environmental lighting for better reflections */}
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
