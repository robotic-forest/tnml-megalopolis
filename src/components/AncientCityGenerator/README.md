# Ancient City Generator

A procedural 3D city generator that creates ancient-style settlements with central temples, platforms, scattered houses and urban structures.

## Architecture

The project is organized in a modular structure:

```
/src/components/AncientCityGenerator/
  ├── index.jsx                     # Main export file
  ├── AncientCitySimulation.jsx     # Main simulation component
  ├── ProceduralCityGenerator.jsx   # Core generation logic
  ├── components/                   # City element components
  │   ├── Ground.jsx                # Ground plane component
  │   ├── Courtyard.jsx             # Courtyard component
  │   ├── Room.jsx                  # Room component
  │   ├── Pathway.jsx               # Pathway component
  │   ├── ScatteredHouse.jsx        # ScatteredHouse component
  │   └── SimpleHouse.jsx           # SimpleHouse component
  ├── platform/                     # Platform-related components
  │   ├── Platform.jsx              # Main platform component
  │   ├── PlatformGeometry.js       # Platform geometry utilities
  │   └── constants.js              # Platform constants
  ├── temple/                       # Temple-related components
  │   ├── Temple.jsx                # Temple component  
  │   └── constants.js              # Temple constants
  ├── ui/                           # User interface components
  │   ├── Controls.jsx              # UI Controls component
  │   └── ControlsToggleIcon.jsx    # Control toggle button
  └── utils/                        # Utility functions
      ├── cityGeneration.js         # City generation utilities
      ├── geometryHelpers.js        # Geometry helper functions
      └── constants.js              # Global constants
```

## Usage

Import and use the AncientCitySimulation component:

```jsx
import AncientCitySimulation from './components/AncientCityGenerator';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AncientCitySimulation />
    </div>
  );
}
```

## Key Components

- **AncientCitySimulation**: The main container component that handles the environment and camera
- **ProceduralCityGenerator**: Core component responsible for generating the city's layout
- **Platform**: Renders the central platform with temple
- **Temple**: Renders a temple structure with multiple styles
- **Courtyard/Room/House**: Components for rendering different building types

## Customizable Parameters

The generator supports a variety of parameters that can be adjusted through the UI controls:

- **City Seed**: Controls the randomization of the entire city
- **Platform Seed**: Controls the randomization of just the central platform
- **Complexity**: Determines how complex the city structure is
- **Height Variation**: Controls the height variance of buildings
- **Platform Style**: Choose between Standard and Stepped platforms
- **Temple Style**: Choose between Simple and Grooved temples
- And many more...

## Modularity

The architecture is designed to be modular and extensible. New city element components, platform styles, and temple styles can be added without significant changes to the core logic.
