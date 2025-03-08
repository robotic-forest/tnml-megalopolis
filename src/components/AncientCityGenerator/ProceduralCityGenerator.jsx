import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import seedrandom from 'seedrandom';
import Platform, { generateIrregularPlatformWithTiers } from './Platform';
import Temple from './Temple';  // Import the separate Temple component

// Settings defaults for easy configuration
export const SETTINGS_DEFAULTS = {
  // General city parameters
  seed: { min: 0, max: 999999, default: 12345, step: 1 },
  complexity: { min: 0.5, max: 2.5, default: 2.0, step: 0.1 },
  heightVariation: { min: 0.1, max: 3.0, default: 1.0, step: 0.1 },
  
  // Platform settings
  platformSeed: { min: 0, max: 999999, default: 23456, step: 1 },
  platformSize: { min: 0.5, max: 2.0, default: 1.0, step: 0.1 },
  
  // Courtyard settings
  courtyardCount: { min: 1, max: 20, default: 9, step: 1 },
  courtyardSize: { min: 0.5, max: 2.0, default: 1.1, step: 0.1 },
  courtyardSpacing: { min: 0.5, max: 5.0, default: 1.4, step: 0.1 },
  
  // Scattered houses settings
  scatteredHouseDensity: { min: 0, max: 16.0, default: 3.5, step: 0.1 },
  scatteredHouseRadius: { min: 0.5, max: 1.2, default: 0.9, step: 0.1 },

  // Display settings
  wireframe: { default: false },

  // Temple settings
  templeSize: { min: 0.5, max: 1.5, default: 1.0, step: 0.1 }
};

// If Math.seedrandom is not defined, add it to the Math object
if (!Math.seedrandom) {
  Math.seedrandom = function(seed) {
    const rng = seedrandom(seed);
    return rng;
  };
}

// Constants for city generation
const CITY_RADIUS = 40;
const COURTYARD_MIN_SIZE = 5;
const COURTYARD_MAX_SIZE = 15;
const ROOM_MIN_SIZE = 2;
const ROOM_MAX_SIZE = 5;
const WALL_HEIGHT = 1.5;
const WALL_THICKNESS = 0.3;

// Main procedural city generator component
const ProceduralCityGenerator = ({ 
  seed = SETTINGS_DEFAULTS.seed.default, 
  complexity = SETTINGS_DEFAULTS.complexity.default, 
  heightVariation = SETTINGS_DEFAULTS.heightVariation.default, 
  courtyardCount = SETTINGS_DEFAULTS.courtyardCount.default, 
  courtyardSize = SETTINGS_DEFAULTS.courtyardSize.default,
  courtyardSpacing = SETTINGS_DEFAULTS.courtyardSpacing.default,
  platformSeed = SETTINGS_DEFAULTS.platformSeed.default,
  platformSize = SETTINGS_DEFAULTS.platformSize.default,
  platformStyle = 'Standard Platform',
  wireframe = SETTINGS_DEFAULTS.wireframe.default,
  enableShadows = true, // Add shadow toggle prop
  scatteredHouseDensity = SETTINGS_DEFAULTS.scatteredHouseDensity.default,
  scatteredHouseRadius = SETTINGS_DEFAULTS.scatteredHouseRadius.default,
  templeStyle = 'Simple Temple', 
  templeSize = SETTINGS_DEFAULTS.templeSize.default,
  onGenerated = () => {}
}) => {
  // Use memo to generate the city layout once and cache it
  const cityLayout = useMemo(() => {
    const layout = generateCityLayout(
      seed, 
      complexity, 
      heightVariation, 
      courtyardCount, 
      courtyardSize, 
      courtyardSpacing,
      platformSeed,
      platformSize,
      scatteredHouseDensity,
      scatteredHouseRadius // Pass the new radius parameter
    );
    
    // Call the onGenerated callback with the complete city layout data
    // Use setTimeout to avoid calling during render
    setTimeout(() => {
      onGenerated && onGenerated(layout);
    }, 0);
    
    return layout;
  }, [seed, complexity, heightVariation, courtyardCount, courtyardSize, courtyardSpacing, platformSeed, platformSize, scatteredHouseDensity, scatteredHouseRadius, onGenerated]);

  return (
    <group>
      {/* Use our separated Platform component with shadows */}
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
      
      {/* Render courtyards with shadows */}
      {cityLayout.courtyards.map((courtyard, index) => (
        <Courtyard 
          key={`courtyard-${index}`} 
          vertices={courtyard.vertices} 
          wireframe={wireframe}
          receiveShadow={enableShadows}
        />
      ))}
      
      {/* Render rooms with shadows */}
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
      
      {/* Render scattered houses with shadows */}
      {cityLayout.scatteredHouses.map((house, index) => (
        house.isSimple ? (
          <SimpleHouse 
            key={`simple-house-${index}`} 
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
        ) : (
          <ScatteredHouse 
            key={`scattered-house-${index}`} 
            vertices={house.vertices} 
            height={house.height} 
            age={house.age}
            width={house.width}
            length={house.length}
            rotation={house.rotation}
            center={house.center}
            wireframe={wireframe}
            castShadow={enableShadows}
            receiveShadow={enableShadows}
          />
        )
      ))}
      
      {/* Render pathways with shadows */}
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

// Generate the entire city layout based on seed and parameters
function generateCityLayout(seed, complexity, heightVariation, courtyardCount, courtyardSize, courtyardSpacing, platformSeed = seed, platformSize = 1.0, scatteredHouseDensity = 2.0, scatteredHouseRadius = 1.0) {
  // Initialize random number generator with seed
  const random = new Math.seedrandom(seed.toString());
  const noise2D = createNoise2D(alea(seed.toString()));
  
  // Use separate platform seed if provided
  const platformRandom = new Math.seedrandom(platformSeed.toString());
  const platformNoise2D = createNoise2D(alea(platformSeed.toString()));
  
  // 1. Create the central platform using the imported function
  const centralPlatform = generateIrregularPlatformWithTiers(0, 0, platformRandom, platformNoise2D, platformSize);
  
  // 2. Initialize secondary courtyards
  const courtyards = [];
  
  // Add additional secondary courtyards based on courtyardCount parameter
  const additionalCourtyards = Math.max(0, courtyardCount);
  const MAX_PLACEMENT_ATTEMPTS = 50; // Maximum attempts to place a courtyard without overlapping
  
  // Calculate the minimum distance from center to place courtyards
  // This ensures courtyards are placed well outside the central platform
  const platformRadius = Math.max(
    centralPlatform.width/2, 
    centralPlatform.depth/2
  ) * 1.5; // Increased buffer from 1.2 to 1.5
  
  for (let i = 0; i < additionalCourtyards; i++) {
    let validPlacement = false;
    let attempts = 0;
    let x = 0, z = 0, size = 0;
    
    // Keep trying to find a valid placement that doesn't overlap
    while (!validPlacement && attempts < MAX_PLACEMENT_ATTEMPTS) {
      attempts++;
      
      // Calculate position with some randomness but still roughly circular arrangement
      const angleBase = (i / additionalCourtyards) * Math.PI * 2;
      const angleVariation = random() * Math.PI * 0.5 - Math.PI * 0.25; // +/- 45 degrees
      const angle = angleBase + angleVariation;
      
      // Distance increases with courtyard spacing parameter
      // Position courtyards outside the central platform
      const distanceMin = platformRadius * courtyardSpacing;
      const distanceMax = CITY_RADIUS * 0.5 * courtyardSpacing;
      const distance = distanceMin + random() * (distanceMax - distanceMin);
      
      x = Math.cos(angle) * distance;
      z = Math.sin(angle) * distance;
      
      // Apply courtyardSize parameter to scale the size
      size = (COURTYARD_MIN_SIZE + random() * (COURTYARD_MAX_SIZE - COURTYARD_MIN_SIZE) * 0.7) * courtyardSize;
      
      validPlacement = true;
      
      // Check for overlap with existing courtyards
      for (const existingCourtyard of courtyards) {
        const dx = existingCourtyard.position.x - x;
        const dz = existingCourtyard.position.z - z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Include spacing factor in minimum distance calculation
        const minDistance = (existingCourtyard.radius + size) * courtyardSpacing;
        
        if (distance < minDistance) {
          validPlacement = false;
          break;
        }
      }
      
      // Check for overlap with central platform
      const distToPlatformCenter = Math.sqrt(x*x + z*z);
      if (distToPlatformCenter < platformRadius) {
        validPlacement = false;
      }
    }
    
    // Only add the courtyard if we found a valid placement
    if (validPlacement) {
      courtyards.push({
        vertices: generatePolygon(x, z, size, 4 + Math.floor(random() * 3), random, noise2D),
        position: { x, z },
        radius: size,
        age: 1 // Age 1 represents slightly newer structures
      });
    }
  }
  
  // 3. Room Expansion via Growth Rules
  const rooms = [];
  
  // Generate rooms around secondary courtyards only
  courtyards.forEach((courtyard, courtyardIndex) => {
    const roomCount = Math.floor(courtyard.vertices.length * (1 + complexity));
    const courtyardCentroid = { x: courtyard.position.x, y: courtyard.position.z };
    
    for (let i = 0; i < roomCount; i++) {
      // Position rooms surrounding the courtyard
      const angle = (i / roomCount) * Math.PI * 2;
      const distance = courtyard.radius + 1 + random() * 2;
      
      const roomX = courtyardCentroid.x + Math.cos(angle) * distance;
      const roomZ = courtyardCentroid.y + Math.sin(angle) * distance;
      
      // Room size varies
      const roomSize = ROOM_MIN_SIZE + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE);
      
      // Apply height variation based on parameter
      const baseHeight = WALL_HEIGHT * (0.8 + random() * 0.4);
      const heightFactor = 0.5 + (noise2D(roomX/10, roomZ/10) * 0.5 + 0.5) * heightVariation;
      const roomHeight = baseHeight * heightFactor;
      
      rooms.push({
        vertices: generatePolygon(roomX, roomZ, roomSize, 4, random, noise2D),
        height: roomHeight,
        age: courtyard.age,
        connected: [{ type: 'courtyard', index: courtyardIndex }],
        position: { x: roomX, z: roomZ }
      });
    }
  });
  
  // Generate secondary rooms as before
  const secondaryRoomCount = Math.floor(rooms.length * complexity * 1.5);
  for (let i = 0; i < secondaryRoomCount; i++) {
    const parentRoomIndex = Math.floor(random() * rooms.length);
    const parentRoom = rooms[parentRoomIndex];
    const parentCentroid = calculateCentroid(parentRoom.vertices);
    
    // Position the new room adjacent to an existing one
    const angle = random() * Math.PI * 2;
    const distance = calculateMaxRadius(parentRoom.vertices, parentCentroid) + 0.5 + random() * 1.5;
    
    const roomX = parentCentroid.x + Math.cos(angle) * distance;
    const roomZ = parentCentroid.y + Math.sin(angle) * distance;
    
    // Secondary rooms tend to be smaller
    const roomSize = ROOM_MIN_SIZE + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) * 0.8;
    
    // Apply height variation based on parameter
    const baseHeight = parentRoom.height * (0.8 + random() * 0.4);
    const heightFactor = 0.5 + (noise2D(roomX/10, roomZ/10) * 0.5 + 0.5) * heightVariation;
    const roomHeight = baseHeight * heightFactor;
    
    // Check if the new room is within city boundary
    const distFromCenter = Math.sqrt(roomX * roomX + roomZ * roomZ);
    if (distFromCenter <= CITY_RADIUS * 0.9) {
      rooms.push({
        vertices: generatePolygon(roomX, roomZ, roomSize, 4, random, noise2D), // Pass noise2D
        height: roomHeight,
        age: parentRoom.age + 1,
        connected: [{ type: 'room', index: parentRoomIndex }]
      });
    }
  }
  
  // 4. Generate pathways
  const pathways = [];

  // Connect rooms to nearby courtyards (not to platform)
  rooms.forEach((room, roomIndex) => {
    room.connected.forEach(connection => {
      // Only process connections to courtyards or other rooms, not to platform
      if (connection.type === 'courtyard') {
        const roomCentroid = calculateCentroid(room.vertices);
        const courtyardCentroid = calculateCentroid(courtyards[connection.index].vertices);
        
        pathways.push({
          points: [
            { x: roomCentroid.x, z: roomCentroid.y },
            { x: courtyardCentroid.x, z: courtyardCentroid.y }
          ],
          width: 0.8 + random() * 0.4
        });
      }
      else if (connection.type === 'room') {
        const roomCentroid = calculateCentroid(room.vertices);
        // Fix: Get the connected room's vertices, not a courtyard's
        const targetRoomCentroid = calculateCentroid(rooms[connection.index].vertices);
        
        pathways.push({
          points: [
            { x: roomCentroid.x, z: roomCentroid.y },
            { x: targetRoomCentroid.x, z: targetRoomCentroid.y }
          ],
          width: 0.8 + random() * 0.4
        });
      }
    });
  });
  
  // Connect some rooms to each other
  const extraConnections = Math.floor(rooms.length * complexity * 0.3);
  for (let i = 0; i < extraConnections; i++) {
    const roomA = Math.floor(random() * rooms.length);
    const roomB = Math.floor(random() * rooms.length);
    
    if (roomA !== roomB) {
      const centroidA = calculateCentroid(rooms[roomA].vertices);
      const centroidB = calculateCentroid(rooms[roomB].vertices);
      
      // Only connect rooms that are reasonably close to each other
      const distance = Math.sqrt(
        Math.pow(centroidA.x - centroidB.x, 2) + 
        Math.pow(centroidA.y - centroidB.y, 2)
      );
      
      if (distance < 10) {
        pathways.push({
          points: [
            { x: centroidA.x, z: centroidA.y },
            { x: centroidB.x, z: centroidB.y }
          ],
          width: 0.6 + random() * 0.3
        });
        
        // Update connection information
        rooms[roomA].connected.push({ type: 'room', index: roomB });
        rooms[roomB].connected.push({ type: 'room', index: roomA });
      }
    }
  }
  
  // Apply some randomization for more organic growth
  rooms.forEach(room => {
    room.vertices = perturbPolygon(room.vertices, 0.2, random);
  });
  
  // 5. Generate scattered houses around the city - pass heightVariation
  const scatteredHouses = generateScatteredHouses(
    random, 
    noise2D, 
    centralPlatform, 
    courtyards, 
    rooms, 
    scatteredHouseDensity,
    heightVariation, // Add the missing parameter
    scatteredHouseRadius // Add the scatter radius parameter
  );
  
  return { 
    centralPlatform,
    courtyards, 
    rooms, 
    pathways,
    scatteredHouses // Add the scattered houses to the output
  };
}

// Function to generate scattered houses throughout the city
function generateScatteredHouses(
  random, 
  noise2D, 
  platform, 
  courtyards, 
  existingRooms, 
  density,
  heightVariation = 1.0,
  radiusMultiplier = 1.0
) {
  const houses = [];
  
  // Calculate the city radius based on the existing structures
  const cityRadius = Math.max(CITY_RADIUS, calculateCityRadius(courtyards, existingRooms));
  
  // Calculate the platform safety radius - no houses closer than this
  const platformSafetyRadius = Math.max(platform.width, platform.depth) * 0.6;
  
  // Apply the radius multiplier but with an extended max radius for falloff
  const baseRadius = cityRadius * radiusMultiplier;
  const adjustedCityRadius = baseRadius; 
  const extendedRadius = baseRadius * 1.5; // Allow houses beyond the normal radius
  
  // Calculate the number of scattered houses based on density parameter and city size
  const baseHouseCount = Math.floor(60 * density); // Increase base count to account for falloff rejection
  const houseCount = Math.floor(baseHouseCount * (1 + adjustedCityRadius / 40));
  
  // Create a grid to check for occupied spaces
  const cellSize = 3;
  const grid = {};
  
  // Mark existing structures in the grid
  function markCellOccupied(x, z) {
    const gridX = Math.floor(x / cellSize);
    const gridZ = Math.floor(z / cellSize);
    const gridKey = `${gridX},${gridZ}`;
    grid[gridKey] = true;
  }
  
  function isCellOccupied(x, z) {
    const gridX = Math.floor(x / cellSize);
    const gridZ = Math.floor(z / cellSize);
    const gridKey = `${gridX},${gridZ}`;
    return !!grid[gridKey];
  }
  
  // Mark courtyards as occupied
  courtyards.forEach(courtyard => {
    const { x, z } = courtyard.position;
    const radius = courtyard.radius + 2; // Add buffer
    
    // Mark a circle around the courtyard
    for (let dx = -radius; dx <= radius; dx += cellSize) {
      for (let dz = -radius; dz <= radius; dz += cellSize) {
        if (dx * dx + dz * dz <= radius * radius) {
          markCellOccupied(x + dx, z + dz);
        }
      }
    }
  });
  
  // Mark existing rooms as occupied
  existingRooms.forEach(room => {
    const centroid = calculateCentroid(room.vertices);
    const radius = calculateMaxRadius(room.vertices, centroid) + 1; // Add buffer
    
    // Mark a circle around the room
    for (let dx = -radius; dx <= radius; dx += cellSize) {
      for (let dz = -radius; dz <= radius; dz += cellSize) {
        if (dx * dx + dz * dz <= radius * radius) {
          markCellOccupied(centroid.x + dx, centroid.y + dz);
        }
      }
    }
  });
  
  // Enhanced function to find distance and nearest structure details
  function findNearestStructure(x, z) {
    let minDistance = Infinity;
    let nearestStructure = null;
    let structureType = null;
    
    // Check distance to courtyards with higher priority
    for (const courtyard of courtyards) {
      const dx = courtyard.position.x - x;
      const dz = courtyard.position.z - z;
      const distance = Math.sqrt(dx * dx + dz * dz) - courtyard.radius * 1.5;
      if (distance < minDistance) {
        minDistance = Math.max(0, distance);
        nearestStructure = courtyard;
        structureType = 'courtyard';
      }
    }
    
    // Check distance to rooms with lower priority (only if significantly closer)
    for (const room of existingRooms) {
      const centroid = calculateCentroid(room.vertices);
      const radius = calculateMaxRadius(room.vertices, centroid);
      const dx = centroid.x - x;
      const dz = centroid.y - z;
      const distance = Math.sqrt(dx * dx + dz * dz) - radius * 1.5;
      
      // Only replace courtyard if room is at least 20% closer
      if (distance < minDistance * 0.8) {
        minDistance = Math.max(0, distance);
        nearestStructure = room;
        structureType = 'room';
      }
    }
    
    return {
      distance: minDistance,
      structure: nearestStructure,
      type: structureType
    };
  }
  
  // Attempt to place houses
  const MAX_PLACEMENT_ATTEMPTS = houseCount * 4; // Increased attempts for better clustering
  let attempts = 0;
  
  while (houses.length < houseCount && attempts < MAX_PLACEMENT_ATTEMPTS) {
    attempts++;
    
    // Calculate a position - two methods:
    // 1. Around a random courtyard (60% of attempts)
    // 2. General area (40% of attempts)
    
    let x, z, nearestInfo;
    
    if (courtyards.length > 0 && random() < 0.6) {
      // Method 1: Position around a random courtyard
      const targetCourtyard = courtyards[Math.floor(random() * courtyards.length)];
      
      // Calculate distance from courtyard center - more density close to the courtyard
      // Use a bell-curve like distribution to cluster houses near the edge
      const distanceFromCenter = targetCourtyard.radius * (1 + random() * random() * 2);
      
      // Random angle around the courtyard
      const angle = random() * Math.PI * 2;
      
      // Calculate position
      x = targetCourtyard.position.x + Math.cos(angle) * distanceFromCenter;
      z = targetCourtyard.position.z + Math.sin(angle) * distanceFromCenter;
      
      // Find nearest structure (which might be a different courtyard/room if closer)
      nearestInfo = findNearestStructure(x, z);
    } 
    else {
      // Method 2: Position anywhere in the city with previous algorithm
      const angle = random() * Math.PI * 2;
      const distance = Math.pow(random(), 0.5) * extendedRadius;
      const adjustedDistance = Math.max(distance, platformSafetyRadius);
      
      x = Math.cos(angle) * adjustedDistance;
      z = Math.sin(angle) * adjustedDistance;
      
      nearestInfo = findNearestStructure(x, z);
    }
    
    // Check if position is already occupied
    if (isCellOccupied(x, z)) {
      continue;
    }
    
    // Calculate distance to center and nearest structure
    const distanceFromCenter = Math.sqrt(x*x + z*z);
    const distToStructure = nearestInfo.distance;
    
    // Calculate probability based on both center distance and distance to structures
    
    // 1. Center-based falloff (decreases with distance from center)
    const centerFalloff = Math.max(0, 1 - Math.pow(distanceFromCenter / extendedRadius, 1.5));
    
    // 2. Structure proximity boost - dramatically increased influence
    // Using a much steeper falloff curve to create dense clusters
    // The 5.0 coefficient makes the falloff happen over a shorter distance
    const proximityDistance = baseRadius * 0.15; // Reduced radius from 0.25 to 0.15
    const proximityBoost = Math.pow(Math.max(0, 1 - Math.min(1, distToStructure / proximityDistance)), 3.0);
    
    // 3. Noise factor for natural variation
    const noiseFactor = 0.35 + noise2D(x/30, z/30) * 0.65;
    
    // Combined probability - dramatically increase structure proximity weight
    const combinedProbability = 
      centerFalloff * 0.15 +       // Reduced from 0.5 to 0.15
      proximityBoost * 0.75 +      // Increased from 0.35 to 0.75
      noiseFactor * 0.10;          // Reduced from 0.15 to 0.10
    
    // Early rejection based on probability
    // Use non-squared probability for more density differences
    if (random() > combinedProbability) {
      continue;
    }
    
    // Additional density near structures - double chance of house placement
    // when very close to a structure
    if (distToStructure < proximityDistance * 0.5 && random() > 0.5) {
      // Even more dense placement near structures
      // Proceed with placement
    } else if (random() > combinedProbability) {
      // Additional rejection check for areas not near structures
      continue;
    }
    
    // Increase chance for simple houses to 80%
    const isSimpleHouse = random() < 0.8;
    
    // House size and height variation
    let width, length, houseHeight, rotation;
    
    // Determine house orientation
    if (nearestInfo.structure && nearestInfo.type === 'courtyard') {
      // Orient house to face the nearby courtyard
      const dx = nearestInfo.structure.position.x - x;
      const dz = nearestInfo.structure.position.z - z;
      rotation = Math.atan2(dz, dx) + (random() * 0.4 - 0.2); // Slight random variation
    }
    else {
      // Random rotation if no nearby courtyard
      rotation = random() * Math.PI;
    }
    
    if (isSimpleHouse) {
      // Smaller simple houses
      width = ROOM_MIN_SIZE * 0.5 + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) * 0.5; // 50-70% size of regular houses
      length = ROOM_MIN_SIZE * 0.5 + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) * 0.6;
      
      // Make simple houses consistently shorter (reduced multiplier range)
      const baseHeight = WALL_HEIGHT * (0.3 + random() * 0.5); // Reduced from (0.4 + random() * 0.7)
      const heightFactor = 0.4 + (noise2D(x/8, z/8) * 0.5 + 0.5) * heightVariation;
      houseHeight = baseHeight * heightFactor;
      
      // Simple house object
      const house = {
        isSimple: true,
        position: { x, z },
        width: width,
        length: length,
        height: houseHeight,
        rotation: rotation,
        age: 1 + Math.floor(random() * 4) // More age variation for simple houses
      };
      
      houses.push(house);
    } 
    else {
      // Regular house with courtyard (existing logic)
      width = ROOM_MIN_SIZE * 0.8 + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) * 0.8;
      length = ROOM_MIN_SIZE * 0.8 + random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) * 1.2;
      const baseHeight = WALL_HEIGHT * (0.7 + random() * 0.5); // Increased from (0.6 + random() * 0.4)
      const heightFactor = 0.5 + (noise2D(x/10, z/10) * 0.5 + 0.5) * heightVariation;
      houseHeight = baseHeight * heightFactor;
      
      // Create a rectangular house, passing the calculated rotation
      const corners = generateRectangularHouseWithRotation(x, z, width, length, rotation, random);
      
      const house = {
        isSimple: false,
        vertices: corners.vertices,
        height: houseHeight,
        age: 1 + Math.floor(random() * 3),
        position: { x, z },
        width: width,
        length: length,
        rotation: rotation, // Use calculated rotation
        center: { x, y: z }
      };
      
      houses.push(house);
    }
    
    // Mark this position as occupied
    markCellOccupied(x, z);
  }
  
  return houses;
}

// Generate a regular polygon with slight randomization
function generatePolygon(centerX, centerY, radius, sides, random, noise2D) {
  const vertices = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    // Use noise2D for more natural variation
    const noiseValue = noise2D(Math.cos(angle), Math.sin(angle)) * 0.2 + 0.9;
    const radiusVariation = radius * noiseValue;
    vertices.push({
      x: centerX + Math.cos(angle) * radiusVariation,
      y: centerY + Math.sin(angle) * radiusVariation
    });
  }
  return vertices;
}

// Add slight random perturbation to polygon vertices for organic look
function perturbPolygon(vertices, intensity, random) {
  return vertices.map(vertex => ({
    x: vertex.x + (random() * 2 - 1) * intensity,
    y: vertex.y + (random() * 2 - 1) * intensity
  }));
}

// Calculate centroid of a polygon
function calculateCentroid(vertices) {
  let sumX = 0;
  let sumY = 0;
  
  vertices.forEach(vertex => {
    sumX += vertex.x;
    sumY += vertex.y;
  });
  
  return {
    x: sumX / vertices.length,
    y: sumY / vertices.length
  };
}

// Calculate maximum radius from centroid to any vertex
function calculateMaxRadius(vertices, centroid) {
  let maxRadius = 0;
  
  vertices.forEach(vertex => {
    const distance = Math.sqrt(
      Math.pow(vertex.x - centroid.x, 2) + 
      Math.pow(vertex.y - centroid.y, 2)
    );
    maxRadius = Math.max(maxRadius, distance);
  });
  
  return maxRadius;
}

// Helper function to calculate the effective radius of the existing city
function calculateCityRadius(courtyards, rooms) {
  let maxRadius = 0;
  
  // Check courtyard positions
  courtyards.forEach(courtyard => {
    const { x, z } = courtyard.position;
    const distance = Math.sqrt(x*x + z*z) + courtyard.radius;
    maxRadius = Math.max(maxRadius, distance);
  });
  
  // Check room positions
  rooms.forEach(room => {
    const centroid = calculateCentroid(room.vertices);
    const distance = Math.sqrt(centroid.x*centroid.x + centroid.y*centroid.y) + 
                     calculateMaxRadius(room.vertices, centroid);
    maxRadius = Math.max(maxRadius, distance);
  });
  
  return maxRadius;
}

// Individual Components for rendering

// Courtyard component - update position Y value to prevent z-fighting and improve materials
const Courtyard = ({ vertices, wireframe = false, receiveShadow = true }) => {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    vertices.forEach((vertex, index) => {
      if (index === 0) {
        shape.moveTo(vertex.x, vertex.y);
      } else {
        shape.lineTo(vertex.x, vertex.y);
      }
    });
    shape.closePath();
    return shape;
  }, [vertices]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.02, 0]}
      receiveShadow={receiveShadow}
    >
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial 
        color="#c7b985" // Brightened from #b5a06a
        roughness={0.7} // Reduced from 0.9 for better light reflection
        metalness={0.1} // Added slight metalness
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  );
};

// Room component with updated beige color palette - brightened colors
const Room = ({ vertices, height, age, wireframe = false, castShadow = true, receiveShadow = true }) => {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    vertices.forEach((vertex, index) => {
      if (index === 0) {
        shape.moveTo(vertex.x, vertex.y);
      } else {
        shape.lineTo(vertex.x, vertex.y);
      }
    });
    shape.closePath();
    return shape;
  }, [vertices]);
  
  // Brighter base colors for better visibility
  const baseRed = 0.85;    // Increased from 0.78
  const baseGreen = 0.75;  // Increased from 0.68
  const baseBlue = 0.55;   // Increased from 0.48
  
  // Apply age-based darkening while maintaining beige tone
  const colorValue = baseRed - age * 0.07;  // Reduced darkening effect
  const greenValue = baseGreen - age * 0.06;
  const blueValue = baseBlue - age * 0.05;
  
  // Ensure colors don't get too dark with age
  const color = new THREE.Color(
    Math.max(0.35, colorValue),  // Increased minimum values
    Math.max(0.30, greenValue),
    Math.max(0.20, blueValue)
  );

  // Create extruded shape for walls
  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: false
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Room walls */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8} // Reduced from 1.0
          metalness={0.05} // Added slight metalness
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Room floor - slightly darker shade of the wall color */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow={receiveShadow}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={color.clone().multiplyScalar(0.8)}  // Less darkening (0.8 vs 0.75)
          roughness={0.8} 
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

// Pathway component - modified to be invisible
const Pathway = ({ points, width, wireframe = false, receiveShadow = true }) => {
  // Option 1: Return null to not render anything at all
  return null;
  
  /* Option 2: Alternative approach - keep the structure but make it invisible
  const shape = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(points[0].x, 0.02, points[0].z),
      new THREE.Vector3(points[1].x, 0.02, points[1].z)
    );
    
    const geometry = new THREE.TubeGeometry(curve, 8, width / 2, 4, false);
    return geometry;
  }, [points, width]);

  return (
    <mesh receiveShadow={receiveShadow}>
      <primitive object={shape} />
      <meshStandardMaterial 
        color="#e0d2b1"
        roughness={0.7}
        metalness={0.05}
        wireframe={wireframe}
        transparent={true}
        opacity={0} // Make completely invisible
      />
    </mesh>
  );
  */
};

// Add a specialized component for scattered houses with inner courtyards
const ScatteredHouse = ({ 
  vertices, height, age, width, length, rotation, center, wireframe = false, 
  castShadow = true, receiveShadow = true 
}) => {
  const shape = useMemo(() => {
    // Create the main outer shape from the vertices
    const shape = new THREE.Shape();
    vertices.forEach((vertex, index) => {
      if (index === 0) {
        shape.moveTo(vertex.x, vertex.y);
      } else {
        shape.lineTo(vertex.x, vertex.y);
      }
    });
    shape.closePath();
    
    // Calculate the inner courtyard dimensions - proportional to the house size
    const courtyardSize = Math.min(width, length) * 0.4; // 40% of the smallest dimension
    
    // Create a perfectly square courtyard aligned with the house walls
    const courtyard = new THREE.Path();
    const halfSize = courtyardSize / 2;
    
    // First create unrotated square courtyard centered at origin
    const unrotatedCorners = [
      { x: -halfSize, y: -halfSize },
      { x: halfSize, y: -halfSize },
      { x: halfSize, y: halfSize },
      { x: -halfSize, y: halfSize }
    ];
    
    // Apply same rotation as house and position at house center
    const rotatedCorners = unrotatedCorners.map(corner => {
      const rotX = corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation);
      const rotY = corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation);
      return {
        x: rotX + center.x,
        y: rotY + center.y
      };
    });
    
    // Create the hole path for the courtyard
    courtyard.moveTo(rotatedCorners[0].x, rotatedCorners[0].y);
    courtyard.lineTo(rotatedCorners[1].x, rotatedCorners[1].y);
    courtyard.lineTo(rotatedCorners[2].x, rotatedCorners[2].y);
    courtyard.lineTo(rotatedCorners[3].x, rotatedCorners[3].y);
    courtyard.closePath();
    
    // Add the courtyard hole to the shape
    shape.holes.push(courtyard);
    
    return { shape, courtyardCorners: rotatedCorners };
  }, [vertices, width, length, rotation, center]);
  
  // Brighter base colors
  const baseRed = 0.85;    // Increased from 0.78
  const baseGreen = 0.75;  // Increased from 0.68
  const baseBlue = 0.55;   // Increased from 0.48
  
  // Reduced darkening effect
  const colorValue = baseRed - age * 0.07;
  const greenValue = baseGreen - age * 0.06;
  const blueValue = baseBlue - age * 0.05;
  
  const color = new THREE.Color(
    Math.max(0.35, colorValue), // Increased from 0.22
    Math.max(0.30, greenValue), // Increased from 0.18
    Math.max(0.20, blueValue)   // Increased from 0.12
  );

  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: false
  };

  return (
    <group position={[0, 0, 0]}>
      {/* House walls with courtyard cutout */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <extrudeGeometry args={[shape.shape, extrudeSettings]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8}
          metalness={0.05}
          wireframe={wireframe}
        />
      </mesh>
      
      {/* House floor with courtyard cutout */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow={receiveShadow}
      >
        <shapeGeometry args={[shape.shape]} />
        <meshStandardMaterial 
          color={color.clone().multiplyScalar(0.82)}
          roughness={0.7}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Courtyard floor - Fixed positioning to avoid visible emanation lines */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[center.x, 0.025, center.y]}
        receiveShadow={receiveShadow}
      >
        <planeGeometry args={[width * 0.39, length * 0.39]} />
        <meshStandardMaterial 
          color="#dac9a0"
          roughness={0.7}
          wireframe={wireframe}
        />
        {/* Removed the problematic nested group */}
      </mesh>
    </group>
  );
};
 
// New component for simple rectangular houses
const SimpleHouse = ({ 
  position, width, length, height, rotation, age, wireframe = false,
  castShadow = true, receiveShadow = true 
}) => {
  // Brighter base colors
  const baseRed = 0.82;    // Increased from 0.75
  const baseGreen = 0.72;  // Increased from 0.65
  const baseBlue = 0.49;   // Increased from 0.42
  
  // Reduced darkening effect
  const colorValue = baseRed - age * 0.08; // Reduced from 0.09
  const greenValue = baseGreen - age * 0.07; // Reduced from 0.08
  const blueValue = baseBlue - age * 0.06; // Reduced from 0.07
  
  const color = new THREE.Color(
    Math.max(0.30, colorValue), // Increased from 0.20
    Math.max(0.25, greenValue), // Increased from 0.16
    Math.max(0.15, blueValue)   // Increased from 0.10
  );
  
  return (
    <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
      {/* Simple box for the house */}
      <mesh 
        position={[0, height/2, 0]} 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.9} // Reduced from 1.1
          metalness={0.05} // Added slight metalness
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
};

// Modified function that takes rotation as an input rather than generating it
function generateRectangularHouseWithRotation(centerX, centerZ, width, length, rotation, random) {
  // Create a basic rectangle
  const halfWidth = width / 2;
  const halfLength = length / 2;
  
  // Apply subtle skew - vary the corners slightly
  const skewAmount = 0.15; // Maximum amount to skew as a fraction of width/length
  
  // Create the 4 corners with skew
  const corners = [
    { // Corner 0: top-left
      x: -halfWidth + (random() * skewAmount * width - skewAmount * width/2),
      y: -halfLength + (random() * skewAmount * length - skewAmount * length/2)
    },
    { // Corner 1: top-right
      x: halfWidth + (random() * skewAmount * width - skewAmount * width/2),
      y: -halfLength + (random() * skewAmount * length - skewAmount * length/2)
    },
    { // Corner 2: bottom-right
      x: halfWidth + (random() * skewAmount * width - skewAmount * width/2),
      y: halfLength + (random() * skewAmount * length - skewAmount * length/2)
    },
    { // Corner 3: bottom-left
      x: -halfWidth + (random() * skewAmount * width - skewAmount * width/2),
      y: halfLength + (random() * skewAmount * length - skewAmount * length/2)
    }
  ];
  
  // Apply rotation
  const rotatedCorners = corners.map(corner => {
    const x = corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation);
    const y = corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation);
    return {
      x: x + centerX,
      y: y + centerZ
    };
  });
  
  return {
    vertices: rotatedCorners,
    rotation: rotation
  };
}

// Keep the original function for backward compatibility but have it call the new one
function generateRectangularHouse(centerX, centerZ, width, length, random) {
  const rotation = random() * Math.PI; // 0 to 180 degrees
  return generateRectangularHouseWithRotation(centerX, centerZ, width, length, rotation, random);
}

export default ProceduralCityGenerator;
