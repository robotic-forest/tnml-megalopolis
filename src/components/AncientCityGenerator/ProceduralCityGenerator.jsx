import React, { useMemo } from 'react';
import Platform from './platform/Platform.jsx';
import Courtyard from './components/Courtyard';
import Room from './components/Room';
import SimpleHouse from './components/SimpleHouse';
import CourtyardHelpers from './components/CourtyardHelpers';

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
  onGenerated = () => {}
}) => {
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
      roomSpread: 1.2
    };
    
    // Call the centralized city generation function
    const layout = generateCityLayout(params);
    
    // Call the onGenerated callback with the complete city layout data
    setTimeout(() => {
      onGenerated && onGenerated(layout);
    }, 0);
    
    return layout;
  }, [seed, complexity, heightVariation, courtyardCount, courtyardSize, 
      courtyardSpacing, platformSeed, platformSize, platformStyle, onGenerated]);

  return (
    <group>
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