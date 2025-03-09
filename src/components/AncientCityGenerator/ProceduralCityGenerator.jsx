import React, { useMemo, useState } from 'react';
import Platform from './platform/Platform.jsx';
import Courtyard from './components/Courtyard';
import Room from './components/Room';
import SimpleHouse from './components/SimpleHouse';
import CourtyardHelpers from './components/CourtyardHelpers';
// Import the procedural ground component
import ProceduralGround from './ground/ProceduralGround';

// Import the generateCityLayout function
import { generateCityLayout } from './utils/cityGeneration';

/**
 * Main procedural city generator component with added debug helpers
 */
const ProceduralCityGenerator = ({ 
  seed = 12345, 
  complexity = 2.0,
  heightVariation = 1.0,
  courtyardCount = 9, 
  courtyardSize = 1.1,
  courtyardSpacing = 1.4,
  platformSeed = 23456,
  platformSize = 1.0,
  platformStyle = 'Standard Platform',
  wireframe = false,
  enableShadows = true,
  templeStyle = 'Simple Temple', 
  templeSize = 1.0,
  showHelpers = false, // Added prop for debug helpers
  roomSpread = 1.2,    // Room spread parameter
  // Ground texture parameters
  groundSeed,          // Optional separate seed for ground texture
  groundColor1 = '#e4d5b7',
  groundColor2 = '#d1bc91',
  groundColor3 = '#c9b188',
  groundDustColor = '#e8dcbf',
  groundStoniness = 0.3,
  groundDustiness = 0.6,
  groundTextureScale = 1,
  // New props for subtle sand
  groundSubtleness = 0.7,
  rippleIntensity = 0.3,
  // New ground tile reduction props
  groundTileScale = 3,
  groundMacroScale = 0.05,
  useVoronoi = true,
  // New terrain feature controls
  terrainFeatures = true,
  featureScale = 1.0,
  featureIntensity = 0.6,
  onGenerated = () => {}
}) => {
  // Track if this is the initial render to prevent unnecessary texture regeneration
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Generate the city layout using the centralized function
  const cityLayout = useMemo(() => {
    // Create parameter object for city generation
    const params = {
      seed,
      complexity,
      heightVariation,
      courtyardCount,
      courtyardSize,
      courtyardSpacing,
      platformSeed,
      platformSize,
      platformStyle,
      roomSpread
    };
    
    // Call the centralized city generation function
    const layout = generateCityLayout(params);
    
    // Call the onGenerated callback with the complete city layout data
    setTimeout(() => {
      onGenerated && onGenerated(layout);
    }, 0);
    
    // After initial render, mark it as complete
    if (isInitialRender) {
      setTimeout(() => setIsInitialRender(false), 100);
    }
    
    return layout;
  }, [seed, complexity, heightVariation, courtyardCount, courtyardSize, 
      courtyardSpacing, platformSeed, platformSize, platformStyle, roomSpread, onGenerated]);

  // Use the main seed for ground if no specific groundSeed is provided
  const effectiveGroundSeed = groundSeed !== undefined ? groundSeed : seed + 10000;

  // Memoize ground component to prevent unnecessary re-renders
  const groundComponent = useMemo(() => {
    return (
      <ProceduralGround 
        size={300}
        resolution={1024}
        seed={effectiveGroundSeed}
        textureScale={groundTextureScale}
        groundColor1={groundColor1}
        groundColor2={groundColor2}
        groundColor3={groundColor3}
        dustColor={groundDustColor}
        stoniness={groundStoniness}
        dustiness={groundDustiness}
        rippleIntensity={rippleIntensity}
        subtleness={groundSubtleness}
        tileScale={groundTileScale}
        macroScale={groundMacroScale}
        useVoronoi={useVoronoi}
        // Pass new terrain feature parameters
        terrainFeatures={terrainFeatures}
        featureScale={featureScale}
        featureIntensity={featureIntensity}
        receiveShadows={enableShadows}
        wireframe={wireframe}
        performanceMode={true} // Enable performance mode by default
      />
    );
  }, [
    // Only depend on ground-related properties
    effectiveGroundSeed,
    groundTextureScale,
    groundColor1,
    groundColor2, 
    groundColor3,
    groundDustColor,
    groundStoniness,
    groundDustiness,
    rippleIntensity,
    groundSubtleness,
    groundTileScale,
    groundMacroScale,
    useVoronoi,
    terrainFeatures,
    featureScale,
    featureIntensity,
    enableShadows,
    wireframe
  ]);

  return (
    <group>
      {/* Add the memoized ground plane */}
      {groundComponent}
      
      {/* Central platform with temple */}
      <Platform 
        baseVertices={cityLayout.centralPlatform.baseVertices}
        topVertices={cityLayout.centralPlatform.topVertices}
        height={cityLayout.centralPlatform.height}
        tier2BaseVertices={cityLayout.centralPlatform.tier2BaseVertices}
        tier2TopVertices={cityLayout.centralPlatform.tier2TopVertices}
        tier2Height={cityLayout.centralPlatform.tier2Height}
        wireframe={wireframe}
        platformSeed={platformSeed}
        platformStyle={platformStyle}
        platformSize={platformSize}
        templeStyle={templeStyle}
        templeSize={templeSize}
        castShadow={enableShadows}
        receiveShadow={enableShadows}
        showHelpers={showHelpers}
      />
      
      {/* Courtyards */}
      {/* {cityLayout.courtyards.map((courtyard, index) => (
        <React.Fragment key={`courtyard-${index}`}>
          <Courtyard 
            vertices={courtyard.vertices} 
            wireframe={wireframe}
            receiveShadow={enableShadows}
          />
          <CourtyardHelpers 
            courtyard={courtyard}
            visible={showHelpers}
          />
        </React.Fragment>
      ))} */}
      
      {/* Rooms */}
      {cityLayout.rooms.map((room, index) => (
        <Room 
          key={`room-${index}`} 
          vertices={room.vertices} 
          height={room.height} 
          age={room.age}
          wireframe={wireframe}
          castShadow={enableShadows}
          receiveShadow={enableShadows}
        />
      ))}
      
      {/* Small houses around courtyards */}
      {cityLayout.scatteredHouses.map((house, index) => (
        <SimpleHouse 
          key={`house-${index}`} 
          position={house.position}
          width={house.width}
          length={house.length}
          height={house.height}
          rotation={house.rotation}
          age={house.age}
          type={house.type} // Use type for debugging colors
          wireframe={wireframe}
          castShadow={enableShadows}
          receiveShadow={enableShadows}
        />
      ))}
      
      {/* REMOVED: Pathways and path helpers */}
    </group>
  );
};

export default ProceduralCityGenerator;