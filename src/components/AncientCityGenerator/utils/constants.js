// Settings defaults for easy configuration
export const SETTINGS_DEFAULTS = {
  // General city parameters
  seed: { min: 1, max: 99999, default: 12345 },
  complexity: { min: 0.5, max: 3.0, default: 2.0, step: 0.1 },
  heightVariation: { min: 0.1, max: 2.0, default: 0.4, step: 0.1 },
  
  // Platform settings
  platformSeed: { min: 1, max: 99999, default: 23456 },
  platformSize: { min: 0.5, max: 1.5, default: 1.0, step: 0.1 },
  
  // Courtyard settings
  courtyardCount: { min: 1, max: 20, default: 9, step: 1 },
  courtyardSize: { min: 0.5, max: 2.0, default: 1.1, step: 0.1 },
  courtyardSpacing: { min: 1.0, max: 2.0, default: 1.4, step: 0.1 },
  
  // Remove scattered houses settings (keeping them in the constants but they won't be used)
  // scatteredHouseDensity: { min: 0.5, max: 10.0, default: 3.5, step: 0.5 },
  // scatteredHouseRadius: { min: 0.5, max: 1.0, default: 0.9, step: 0.1 },

  // Display settings
  wireframe: { default: false },

  // Temple settings
  templeSize: { min: 0.5, max: 1.5, default: 1.0, step: 0.1 }
};

// Constants for city generation
export const CITY_RADIUS = 50;
export const COURTYARD_MIN_SIZE = 4.0;
export const COURTYARD_MAX_SIZE = 8.0;
export const ROOM_MIN_SIZE = 2.0;
export const ROOM_MAX_SIZE = 4.0;
export const WALL_HEIGHT = 3.0;
export const WALL_THICKNESS = 0.3;
