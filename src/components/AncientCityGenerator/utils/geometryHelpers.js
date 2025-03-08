import * as THREE from 'three';

/**
 * Generate a regular polygon with slight randomization
 * @param {number} centerX - X coordinate of center
 * @param {number} centerY - Y coordinate of center (actually Z in Three.js)
 * @param {number} radius - Base radius of polygon
 * @param {number} sides - Number of sides
 * @param {Function} noise2D - 2D noise function
 * @param {Function} random - Optional random function for additional variation
 * @returns {Array} Array of vertices with x,y coordinates
 */
export function generatePolygon(centerX, centerY, radius, sides, noise2D, random) {
  const vertices = [];
  
  // If noise2D is not provided, use a simple function that returns 0
  const noiseFunc = noise2D && typeof noise2D === 'function' 
    ? noise2D 
    : () => 0;
    
  // If random is not provided, use a simple function that returns 0.5
  const randomFunc = random && typeof random === 'function'
    ? random
    : () => 0.5;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    // Calculate base position
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    
    // Use noise to vary the radius
    // Add a try-catch to handle potential errors
    let noiseValue;
    try {
      noiseValue = noiseFunc(x, y) * 0.2 + 0.9; // 20% variation around 0.9
    } catch (error) {
      // If noise function fails, use random
      noiseValue = 0.9 + randomFunc() * 0.2;
      console.warn("Noise function failed, using random instead:", error);
    }
    
    const radiusVariation = radius * noiseValue;
    
    // Add slightly randomized vertex
    vertices.push({
      x: centerX + x * radiusVariation,
      y: centerY + y * radiusVariation
    });
  }
  
  return vertices;
}

/**
 * Add slight random perturbation to polygon vertices for organic look
 */
export function perturbPolygon(vertices, intensity, random) {
  return vertices.map(vertex => ({
    x: vertex.x + (random() * 2 - 1) * intensity,
    y: vertex.y + (random() * 2 - 1) * intensity
  }));
}

/**
 * Calculate centroid of a polygon
 */
export function calculateCentroid(vertices) {
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

/**
 * Calculate maximum radius from centroid to any vertex
 */
export function calculateMaxRadius(vertices, centroid) {
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

/**
 * Calculate the area of a polygon
 */
export function calculatePolygonArea(polygon) {
  // Implementation of the shoelace formula
  let area = 0;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * Check if a point is inside a polygon
 */
export function isPointInPolygon(point, polygon) {
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Get the bounds of a polygon (min/max coordinates)
 */
export function getPolygonBounds(polygon) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  polygon.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Generate a rectangular house with given dimensions and rotation
 */
export function generateRectangularHouseWithRotation(centerX, centerZ, width, length, rotation, random) {
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
