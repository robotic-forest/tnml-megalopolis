import { create } from 'zustand';

export const useGardenStore = create((set) => ({
  // Track discovered secrets
  discoveredSecrets: 0,
  
  // Add a discovered secret
  addDiscoveredSecret: () => set((state) => ({ 
    discoveredSecrets: Math.min(state.discoveredSecrets + 1, 7) 
  })),
  
  // Reset all secrets
  resetSecrets: () => set({ discoveredSecrets: 0 }),
  
  // Player position for collision detection
  playerPosition: [0, 0, 0],
  setPlayerPosition: (position) => set({ playerPosition: position }),
  
  // Environment settings
  ambientIntensity: 0.2,
  setAmbientIntensity: (intensity) => set({ ambientIntensity: intensity }),
  
  // Time of day cycle
  timeOfDay: 0, // 0-1 representing day cycle
  advanceTime: (amount) => set((state) => ({ 
    timeOfDay: (state.timeOfDay + amount) % 1 
  })),

  // Navigation indicator
  navigating: false,
  setNavigating: (value) => set({ navigating: value }),
  
  // Portal destinations
  portalDestinations: {
    runes: '/',
    monolith: '/',
    reality: '/shapes',
    crystal: '/extrusions',
    shrine: '/',
    pool: '/extrusions',
    passage: '/shapes'
  }
}));
