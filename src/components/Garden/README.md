# Eldritch Garden

An interactive 3D environment created with React Three Fiber that features:

- Strange and unusual plants
- Fantastical creatures
- Mystical objects of power
- Hidden places and secrets

## Components

- `Garden.jsx` - Main component that sets up the scene
- `GardenGround.jsx` - Creates the ground plane with animated textures
- `EldritchPlants.jsx` - Various strange plant life forms
- `FantasticalCreatures.jsx` - Animated beings that inhabit the garden
- `ObjectsOfPower.jsx` - Interactive mystical objects
- `HiddenPlaces.jsx` - Secret locations that can be discovered
- `store.js` - State management for the garden interactions

## Installation

Ensure you have the required dependencies:

```bash
npm install three @react-three/fiber @react-three/drei @react-three/cannon zustand
```

## Usage

```jsx
import { Garden } from './components/Garden';

function App() {
  return (
    <div className="App">
      <Garden />
    </div>
  );
}
```

## Interactions

The garden contains several interactive elements:

1. **Objects of Power** - Click on rune stones, crystals, and other objects to activate them
2. **Hidden Places** - Discover secret locations throughout the garden
3. **Camera Controls** - Use OrbitControls to navigate the environment

## Secrets

There are 7 total secrets to discover throughout the garden. Each discovery is tracked in the garden's state via `useGardenStore`.

## Customization

You can adjust the garden by modifying the positions, colors, and scales of various elements in their respective component files.

## Performance Considerations

The scene uses the `<PerformanceMonitor>` component to automatically adjust quality based on the user's device performance.
