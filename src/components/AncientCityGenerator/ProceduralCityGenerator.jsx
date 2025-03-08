import React, { useMemo } from 'react';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import seedrandom from 'seedrandom';

// Component imports
import Platform from './platform/Platform.jsx';
import Courtyard from './components/Courtyard';
import Room from './components/Room';
import Pathway from './components/Pathway';
import SimpleHouse from './components/SimpleHouse';

// Import the generateCityLayout function to centralize city generation logic
import { generateCityLayout } from './utils/cityGeneration';

// Utility imports
import { CITY_RADIUS } from './utils/constants';

// Import platform generator
import { generateIrregularPlatformWithTiers } from './platform/PlatformGeometry.js';

/**
 * Main procedural city generator component
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
      platformStyle
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
      />
      
      {/* Courtyards */}
      {cityLayout.courtyards.map((courtyard, index) => (
        <Courtyard 
          key={`courtyard-${index}`} 
          vertices={courtyard.vertices} 
          wireframe={wireframe}
          receiveShadow={enableShadows}
        />
      ))}
      
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
          wireframe={wireframe}
          castShadow={enableShadows}
          receiveShadow={enableShadows}
        />
      ))}
      
      {/* Pathways */}
      {cityLayout.pathways.map((path, index) => (
        <Pathway 
          key={`path-${index}`} 
          points={path.points} 
          width={path.width}
          wireframe={wireframe}
          receiveShadow={enableShadows}
        />
      ))}
    </group>
  );
};

export default ProceduralCityGenerator;