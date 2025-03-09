import * as THREE from 'three';
import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
// Import ALL required constants
import { 
  CITY_RADIUS,
  COURTYARD_MIN_SIZE,
  COURTYARD_MAX_SIZE,
  ROOM_MIN_SIZE,
  ROOM_MAX_SIZE,
  WALL_HEIGHT 
} from './constants';
import { 
  isPointInPolygon, 
  calculateCentroid, 
  generatePolygon,
  generateRectangularHouseWithRotation,
  perturbPolygon,
  calculateMaxRadius 
} from './geometryHelpers';

// Import platform generator
import { generateIrregularPlatformWithTiers } from '../platform/PlatformGeometry.js';

// Helper functions that need to be created if they don't exist
/**
 * Generates courtyards around the central platform
 */
function generateCourtyards(random, noise2D, centralPlatform, courtyardCount, courtyardSize, courtyardSpacing) {
  const courtyards = [];
  
  // Add additional secondary courtyards based on courtyardCount parameter
  const additionalCourtyards = Math.max(0, courtyardCount);
  const MAX_PLACEMENT_ATTEMPTS = 50;
  
  // Calculate the minimum distance from center to place courtyards
  const platformRadius = Math.max(
    centralPlatform.width/2, 
    centralPlatform.depth/2
  ) * 1.5;
  
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
      const distanceMin = platformRadius * courtyardSpacing;
      const distanceMax = CITY_RADIUS * 0.5 * courtyardSpacing;
      const distance = distanceMin + random() * (distanceMax - distanceMin);
      
      x = Math.cos(angle) * distance;
      z = Math.sin(angle) * distance;
      
      // Apply courtyardSize parameter to scale the size
      size = (COURTYARD_MIN_SIZE + random() * (COURTYARD_MAX_SIZE - COURTYARD_MIN_SIZE) * 0.7) 
              * courtyardSize;
      
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
        vertices: generatePolygon(
          x, 
          z, 
          size, 
          4 + Math.floor(random() * 3), 
          noise2D, 
          random
        ),
        position: { x, z },
        radius: size,
        age: 1 // Age 1 represents slightly newer structures
      });
    }
  }
  
  return courtyards;
}

/**
 * Generates rooms around courtyards
 */
function generateRooms(random, noise2D, courtyards, complexity, heightVariation) {
  const rooms = [];
  
  // Remove these redundant constant declarations since they're now imported
  // const ROOM_MIN_SIZE = 2.0; 
  // const ROOM_MAX_SIZE = 4.0;
  // const WALL_HEIGHT = 3.0;
  
  // Generate rooms around secondary courtyards only
  courtyards.forEach((courtyard, courtyardIndex) => {
    const roomCount = Math.floor(courtyard.vertices.length * (1 + complexity));
    const courtyardCentroid = calculateCentroid(courtyard.vertices);
    
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
        vertices: generatePolygon(roomX, roomZ, roomSize, 4, noise2D, random),
        height: roomHeight,
        age: courtyard.age,
        connected: [{ type: 'courtyard', index: courtyardIndex }],
        position: { x: roomX, z: roomZ }
      });
    }
  });
  
  // Generate secondary rooms 
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
    
    // Apply height variation 
    const baseHeight = parentRoom.height * (0.8 + random() * 0.4);
    const heightFactor = 0.5 + (noise2D(roomX/10, roomZ/10) * 0.5 + 0.5) * heightVariation;
    const roomHeight = baseHeight * heightFactor;
    
    // Check if the new room is within city boundary
    const distFromCenter = Math.sqrt(roomX * roomX + roomZ * roomZ);
    if (distFromCenter <= CITY_RADIUS * 10) {
      rooms.push({
        vertices: generatePolygon(roomX, roomZ, roomSize, 4, noise2D, random),
        height: roomHeight,
        age: parentRoom.age + 1,
        connected: [{ type: 'room', index: parentRoomIndex }]
      });
    }
  }
  
  // Apply some randomization for more organic growth
  rooms.forEach(room => {
    room.vertices = perturbPolygon(room.vertices, 0.2, random);
  });
  
  return rooms;
}

/**
 * Generates small houses around courtyards, preventing overlap with the central platform
 */
function generateCourtyardHouses(random, noise2D, courtyards, rooms, centralPlatform, heightVariation) {
  const smallHouses = [];
  
  // Calculate platform radius for collision detection
  const platformRadius = Math.max(centralPlatform.width / 2, centralPlatform.depth / 2);
  
  // Improved collision detection for house placement
  const isOverlapping = (x, z, width, length) => {
    const padding = 0.3;
    const halfWidth = (width / 2) + padding;
    const halfLength = (length / 2) + padding;
    
    // Check overlap with central platform
    const distanceToCenter = Math.sqrt(x*x + z*z);
    // Add padding to platform radius to prevent houses being too close
    if (distanceToCenter < platformRadius + Math.max(halfWidth, halfLength) + 1.0) {
      return true;
    }
    
    // Check corners of the potential house
    const corners = [
      { x: x - halfWidth, y: z - halfLength },
      { x: x + halfWidth, y: z - halfLength },
      { x: x + halfWidth, y: z + halfLength },
      { x: x - halfWidth, y: z + halfLength }
    ];
    
    // Check against rooms
    for (const room of rooms) {
      for (const corner of corners) {
        if (isPointInPolygon(corner, room.vertices)) {
          return true;
        }
      }
    }
    
    // Check against existing small houses
    for (const house of smallHouses) {
      const dx = house.position.x - x;
      const dz = house.position.z - z;
      const distance = Math.sqrt(dx*dx + dz*dz);
      
      const minDistance = 
        Math.max(house.width, house.length) / 2 + 
        Math.max(width, length) / 2 + 
        padding;
        
      if (distance < minDistance) {
        return true;
      }
    }
    
    return false;
  };
  
  // Process each courtyard to add houses around it
  courtyards.forEach((courtyard, courtyardIndex) => {
    const center = calculateCentroid(courtyard.vertices);

    // Calculate base number of houses with some randomization to add variety
    const sizeRatio = Math.min(1.5, Math.max(0.5, courtyard.radius / 5));
    const houseVariation = 0.8 + random() * 0.4; // 0.8-1.2 variation factor
    const houseCount = Math.floor(220 * sizeRatio * houseVariation);
    
    // Split houses across three rings with a more gradual distribution
    const innerRingCount = Math.ceil(houseCount * 0.45); // 45% in inner ring
    const middleRingCount = Math.floor(houseCount * 0.35); // 35% in middle ring
    const outerRingCount = Math.floor(houseCount * 0.20); // 20% in outer ring
    
    // 1. INNER RING - closest to courtyard
    const innerRingRadius = courtyard.radius * 1.2; 
    
    for (let i = 0; i < innerRingCount; i++) {
      // More organized placement for inner ring
      const angleStep = (Math.PI * 2) / innerRingCount;
      const angle = i * angleStep + (random() * 0.12 - 0.06); // Small randomization
      
      // Tight distance variation for inner ring
      const distance = innerRingRadius * (0.95 + random() * 0.1); 
      const x = center.x + Math.cos(angle) * distance;
      const z = center.y + Math.sin(angle) * distance;
      
      // Larger houses for inner ring
      const width = 2.4 + random() * 1.2;  // 2.4-3.6 units
      const length = 2.4 + random() * 1.2;
      
      // Taller houses
      const baseHeight = 1.6 + random() * 0.8;
      const heightFactor = 0.9 + (noise2D(x/15, z/15) * 0.2) * heightVariation;
      const height = baseHeight * heightFactor;
      
      if (!isOverlapping(x, z, width, length)) {
        smallHouses.push({
          position: { x, z },
          width,
          length,
          height,
          rotation: random() * Math.PI * 2,
          age: 0.5 + random() * 0.5, // Newest houses
          courtyardIndex,
          type: 'large' // Mark as large house
        });
      }
    }
    
    // 2. MIDDLE RING - transitional zone
    const middleRingRadius = courtyard.radius * 2.1;
    
    for (let i = 0; i < middleRingCount; i++) {
      // Semi-organized with more variation
      const angleBase = (i / middleRingCount) * Math.PI * 2;
      const angleJitter = random() * 0.3 - 0.15; // More jitter than inner ring
      const angle = angleBase + angleJitter;
      
      // Wider distance range
      const minDist = courtyard.radius * 1.9;
      const maxDist = courtyard.radius * 2.4;
      const distance = minDist + random() * (maxDist - minDist);
      
      const x = center.x + Math.cos(angle) * distance;
      const z = center.y + Math.sin(angle) * distance;
      
      // Medium-sized houses - transition between inner and outer
      const width = 1.8 + random() * 0.8;   // 1.8-2.6 units
      const length = 1.8 + random() * 0.8;  // 1.8-2.6 units
      
      // Medium height
      const baseHeight = 1.4 + random() * 0.6;  // 1.4-2.0 units
      const heightFactor = 0.85 + (noise2D(x/18, z/18) * 0.25) * heightVariation;
      const height = baseHeight * heightFactor;
      
      if (!isOverlapping(x, z, width, length)) {
        smallHouses.push({
          position: { x, z },
          width,
          length,
          height,
          rotation: random() * Math.PI * 2,
          age: 0.8 + random() * 0.7, // Medium age
          courtyardIndex,
          type: 'medium' // Mark as medium house
        });
      }
    }
    
    // 3. OUTER RING - scattered further houses
    for (let i = 0; i < outerRingCount; i++) {
      // Fully randomized placement for natural tapering
      const angle = random() * Math.PI * 2;
      
      // Wide distance range for scattered feeling
      const minDist = courtyard.radius * 2.4;
      const maxDist = courtyard.radius * 3.5; // Extended furthest distance
      const distance = minDist + random() * (maxDist - minDist);
      
      const x = center.x + Math.cos(angle) * distance;
      const z = center.y + Math.sin(angle) * distance;
      
      // Smaller houses for outer periphery
      const width = 1.2 + random() * 1.0;   // 1.2-2.2 units
      const length = 1.2 + random() * 1.0;  // 1.2-2.2 units
      
      // Lower heights
      const baseHeight = 1.0 + random() * 0.6;  // 1.0-1.6 units
      const heightFactor = 0.8 + (noise2D(x/20, z/20) * 0.3) * heightVariation;
      const height = baseHeight * heightFactor;
      
      if (!isOverlapping(x, z, width, length)) {
        smallHouses.push({
          position: { x, z },
          width,
          length,
          height,
          rotation: random() * Math.PI * 2,
          age: 1.2 + random() * 1.2, // Oldest houses
          courtyardIndex,
          type: 'small' // Mark as small house
        });
      }
    }
    
    // 4. SPARSE OUTLIERS - very scattered tiny houses at the periphery for realistic tapering
    const outlierCount = Math.floor(houseCount * 0.05); // Just 5% as outliers
    
    for (let i = 0; i < outlierCount; i++) {
      const angle = random() * Math.PI * 2;
      
      // Very far range for outliers
      const minDist = courtyard.radius * 3.3;
      const maxDist = courtyard.radius * 4.5;
      const distance = minDist + random() * (maxDist - minDist);
      
      const x = center.x + Math.cos(angle) * distance;
      const z = center.y + Math.sin(angle) * distance;
      
      // Check if within city bounds
      const distFromCenter = Math.sqrt(x*x + z*z);
      if (distFromCenter > CITY_RADIUS) continue;
      
      // Smallest houses for outliers
      const width = 0.9 + random() * 0.7;   // 0.9-1.6 units
      const length = 0.9 + random() * 0.7;  // 0.9-1.6 units
      
      // Lowest heights
      const baseHeight = 0.8 + random() * 0.5;  // 0.8-1.3 units
      const heightFactor = 0.7 + (noise2D(x/25, z/25) * 0.3) * heightVariation;
      const height = baseHeight * heightFactor;
      
      // Lower collision standards for outliers to allow more placement
      if (!isOverlapping(x, z, width, length)) {
        smallHouses.push({
          position: { x, z },
          width,
          length,
          height,
          rotation: random() * Math.PI * 2,
          age: 1.8 + random() * 1.0, // Oldest houses (ruins)
          courtyardIndex,
          type: 'tiny' // Mark as tiny house
        });
      }
    }
  });
  
  return smallHouses;
}

/**
 * Generates a city layout based on given parameters
 * 
 * @param {Object} params - City generation parameters
 * @returns {Object} - Complete city layout data
 */
export function generateCityLayout(params) {
  const { 
    seed, complexity, heightVariation, courtyardCount,
    courtyardSize, courtyardSpacing, platformSeed,
    platformSize
  } = params;
  
  // Initialize random number generators
  const random = seedrandom(seed.toString());
  const noise2D = createNoise2D(alea(seed.toString()));
  
  // Platform-specific random generators
  const platformRandom = seedrandom(platformSeed.toString());
  const platformNoise2D = createNoise2D(alea(platformSeed.toString()));
  
  // Generate central platform
  const centralPlatform = generateIrregularPlatformWithTiers(
    0, 0, platformRandom, platformNoise2D, platformSize
  );
  
  // Generate courtyards
  const courtyards = generateCourtyards(
    random, noise2D, centralPlatform, courtyardCount, courtyardSize, courtyardSpacing
  );
  
  // Generate rooms around courtyards
  const rooms = generateRooms(
    random, noise2D, courtyards, complexity, heightVariation
  );
  
  // REMOVED: Generate pathways between structures
  
  // Generate small houses around courtyards - now passing centralPlatform
  const courtyardHouses = generateCourtyardHouses(
    random, noise2D, courtyards, rooms, centralPlatform, heightVariation
  );
  
  // Return city layout without pathways
  return {
    centralPlatform,
    courtyards,
    rooms,
    scatteredHouses: courtyardHouses
  };
}
