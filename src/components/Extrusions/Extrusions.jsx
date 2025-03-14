import React, { useMemo, useRef, forwardRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
// Import useLocation from wouter
import { useLocation } from 'wouter';

// Import the JSON file with the list of red god files
import redGodFiles from './red-god-files.json';

// Make the file list available as a variable
const redGodImageFiles = redGodFiles.files.map(filename => `/red_god/${filename}`);

// Add a global state for the strange effect triggered by the special pyramid
const globalState = {
  ritualActivated: false,
  ritualProgress: 0,
};

// Convert HexagonalObject to use forwardRef to properly pass refs
const HexagonalObject = forwardRef(({
  height = 0.6,
  topRadius = 1.0,
  bottomRadius = 1.5,
  position = [0, 0, 0],
  color = '#8B0000'
}, ref) => {
  // Create custom geometry for the truncated hexagonal pyramid
  const baseVertices = [];
  const topVertices = [];
  
  // Generate vertices for bottom and top hexagons
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    baseVertices.push(new THREE.Vector3(
      bottomRadius * Math.cos(angle),
      -height / 2,
      bottomRadius * Math.sin(angle)
    ));
    
    topVertices.push(new THREE.Vector3(
      topRadius * Math.cos(angle),
      height / 2,
      topRadius * Math.sin(angle)
    ));
  }
  
  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  
  // Add vertices to array
  baseVertices.forEach(v => vertices.push(v.x, v.y, v.z));
  topVertices.forEach(v => vertices.push(v.x, v.y, v.z));
  
  // Add bottom center and top center vertices
  vertices.push(0, -height/2, 0); // bottom center (12)
  vertices.push(0, height/2, 0);  // top center (13)
  
  // Add bottom face triangles
  for (let i = 0; i < 6; i++) {
    indices.push(12, i, (i + 1) % 6);
  }
  
  // Add top face triangles
  for (let i = 0; i < 6; i++) {
    indices.push(13, 6 + ((i + 1) % 6), 6 + i);
  }
  
  // Add side triangles
  for (let i = 0; i < 6; i++) {
    // First triangle of quad
    indices.push(i, 6 + i, 6 + ((i + 1) % 6));
    // Second triangle of quad
    indices.push(i, 6 + ((i + 1) % 6), (i + 1) % 6);
  }
  
  // Set indices and position attributes
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  // Compute normals for proper lighting
  geometry.computeVertexNormals();
  
  // Darkish red material with flat shading and full roughness (non-metallic)
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1.0, 
    metalness: 0,
    flatShading: true
  });
  
  return (
    <mesh 
      ref={ref} 
      geometry={geometry} 
      material={material}
      position={position}
    />
  );
});

// Navigation pyramid component that rotates and links to /shapes
function NavigationPyramid({ position, scale }) {
  const [location, setLocation] = useLocation();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Continuously rotate the pyramid
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Slow continuous rotation around Y-axis
      groupRef.current.rotation.y = time * 0.2;
      
      // Gentle bobbing motion
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.3;
      
      // Subtle scale pulsing when hovered
      const pulseScale = hovered ? 1 + Math.sin(time * 2) * 0.05 : 1;
      groupRef.current.scale.set(
        scale[0] * pulseScale,
        scale[1] * pulseScale,
        scale[2] * pulseScale
      );
    }
  });
  
  // Navigate to /shapes on click
  const handleClick = (e) => {
    e.stopPropagation();
    setLocation('/shapes');
  };
  
  // Handle hover states
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Use a different color than the ritual pyramid */}
      <mesh>
        <octahedronGeometry args={[1, 0]} /> {/* Using octahedron for distinct shape */}
        <meshStandardMaterial 
          color="#00ccff"  /* Cyan blue color */
          emissive="#00ccff"
          emissiveIntensity={hovered ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Add a ring around the octahedron for visual distinction */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 32]} />
        <meshStandardMaterial 
          color="#0088aa"
          emissive="#00ccff"
          emissiveIntensity={hovered ? 1 : 0.3}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Add a second perpendicular ring */}
      <mesh rotation={[0, 0, Math.PI/2]}>
        <torusGeometry args={[1.5, 0.02, 16, 32]} />
        <meshStandardMaterial 
          color="#0088aa"
          emissive="#00ccff"
          emissiveIntensity={hovered ? 1 : 0.3}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Add a blue light */}
      <pointLight color="#00ccff" intensity={2} distance={8} />
    </group>
  );
}

function HexagonalPyramid({ 
  position, 
  scale, 
  rotationOffset = 0, 
  distanceFromCenter = 0,
  url = null,
  hoverColor = null,
  isSpecial = false,
  onRitualActivate = null,
}) {
  const groupRef = useRef();
  const middleGroupRef = useRef();
  const topGroupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // State to track color transition progress (0 to 1)
  const [colorTransition, setColorTransition] = useState(0);
  
  // Base colors - make the special pyramid much lighter
  const baseColor = new THREE.Color(isSpecial ? "#E0C0C0" : "#8B0000");
  const middleColor = new THREE.Color(isSpecial ? "#E8D0D0" : "#A52A2A");
  const topColor = new THREE.Color(isSpecial ? "#F0E0E0" : "#CD5C5C");
  
  // Add a subtle glow to the special pyramid
  useEffect(() => {
    if (isSpecial && groupRef.current) {
      // Add a subtle pulsing animation
      const interval = setInterval(() => {
        if (groupRef.current) {
          const time = Date.now() * 0.001;
          const pulse = Math.sin(time) * 0.1 + 1;
          groupRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isSpecial, scale]);
  
  // Calculate hover colors - either use provided hoverColor or lighten existing colors
  const getHoverColor = (originalColor) => {
    if (hoverColor) return new THREE.Color(hoverColor);
    
    // Lighten the original color
    const color = originalColor.clone();
    color.r = Math.min(color.r * 1.3, 1);
    color.g = Math.min(color.g * 1.3, 1);
    color.b = Math.min(color.b * 1.3, 1);
    return color;
  };
  
  const hoverBaseColor = getHoverColor(baseColor);
  const hoverMiddleColor = getHoverColor(middleColor);
  const hoverTopColor = getHoverColor(topColor);
  
  // Current interpolated colors
  const currentBaseColor = useMemo(() => new THREE.Color(), []);
  const currentMiddleColor = useMemo(() => new THREE.Color(), []);
  const currentTopColor = useMemo(() => new THREE.Color(), []);
  
  // Animation for object movement and color transition
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    // Calculate oscillation value for vertical movement
    const time = clock.getElapsedTime();
    
    // If the ritual is activated, make regular pyramids pulse in unison
    if (globalState.ritualActivated && !isSpecial) {
      const ritualPulse = Math.sin(time * 4) * 0.2 * globalState.ritualProgress;
      const baseScale = scale[0];
      groupRef.current.scale.set(
        baseScale * (1 + ritualPulse),
        baseScale * (1 + ritualPulse),
        baseScale * (1 + ritualPulse)
      );
      
      // Make them glow redder as the ritual progresses
      if (groupRef.current.children[0]?.material) {
        const intensity = 1 + globalState.ritualProgress * 3;
        groupRef.current.children[0].material.emissiveIntensity = globalState.ritualProgress;
        groupRef.current.children[0].material.emissive = new THREE.Color(1, 0, 0);
      }
    } else {
      const oscillation = Math.sin(time * 0.8 + rotationOffset);
      
      // Apply position changes to the group containers
      if (middleGroupRef.current) {
        middleGroupRef.current.position.y = 0.3 + oscillation * 0.18;
      }
      
      if (topGroupRef.current) {
        topGroupRef.current.position.y = 0.6 + oscillation * 0.3;
      }
    }
    
    // Smoothly transition the color based on hover state
    const targetTransition = hovered ? 1 : 0;
    const transitionSpeed = 0.05; // Adjust for faster/slower transitions
    
    if (colorTransition !== targetTransition) {
      if (colorTransition < targetTransition) {
        setColorTransition(Math.min(colorTransition + transitionSpeed, 1));
      } else {
        setColorTransition(Math.max(colorTransition - transitionSpeed, 0));
      }
    }
    
    // Interpolate the colors
    currentBaseColor.copy(baseColor).lerp(hoverBaseColor, colorTransition);
    currentMiddleColor.copy(middleColor).lerp(hoverMiddleColor, colorTransition);
    currentTopColor.copy(topColor).lerp(hoverTopColor, colorTransition);
    
    // Apply colors to materials
    if (groupRef.current.children[0]?.material) {
      groupRef.current.children[0].material.color = currentBaseColor;
    }
    
    if (middleGroupRef.current?.children[0]?.material) {
      middleGroupRef.current.children[0].material.color = currentMiddleColor;
    }
    
    if (topGroupRef.current?.children[0]?.material) {
      topGroupRef.current.children[0].material.color = currentTopColor;
    }
  });

  // Set up pointer events
  const handlePointerOver = (e) => {
    if (url || isSpecial) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
      e.stopPropagation();
    }
  };
  
  const handlePointerOut = () => {
    if (url || isSpecial) {
      setHovered(false);
      document.body.style.cursor = 'auto';
    }
  };
  
  const handleClick = (e) => {
    if (isSpecial) {
      // Trigger the special effect
      if (onRitualActivate) onRitualActivate();
      e.stopPropagation();
    } else if (url) {
      window.open(url, '_blank');
      e.stopPropagation();
    }
  };

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Base level - darkest */}
      <HexagonalObject 
        height={0.6} 
        bottomRadius={1.5} 
        topRadius={1.0} 
        position={[0, 0, 0]} 
        color={baseColor}  // Just pass the initial color, we'll update it in useFrame
      />
      
      {/* Middle level - medium - animated - wrap in a group */}
      <group ref={middleGroupRef} position={[0, 0.5, 0]}>
        <HexagonalObject 
          height={0.6} 
          bottomRadius={0.9} 
          topRadius={0.65} 
          position={[0, 0, 0]} 
          color={middleColor} 
        />
      </group>
      
      {/* Top level - lightest - animated - wrap in a group */}
      <group ref={topGroupRef} position={[0, 0.8, 0]}>
        <HexagonalObject 
          height={0.4} 
          bottomRadius={0.6} 
          topRadius={0.4} 
          position={[0, 0, 0]}  
          color={topColor} 
        />
      </group>
      
      {/* Special glow effect for the special pyramid */}
      {isSpecial && (
        <pointLight 
          color="#ff5555"
          intensity={1}
          distance={10}
          position={[0, 2, 0]}
        />
      )}
    </group>
  );
}

// Rising entity effect
function RisingEntity({ active }) {
  const entityRef = useRef();
  const startTime = useRef(null);

  useFrame(({ clock }) => {
    if (!active || !entityRef.current) return;
    
    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime();
    }
    
    const elapsed = clock.getElapsedTime() - startTime.current;
    const progress = Math.min(elapsed / 10, 1); // 10 seconds to fully rise
    globalState.ritualProgress = progress;
    
    // Rise from beneath the ground to a higher position
    entityRef.current.position.y = -5 + progress * 20; // Start at -5 instead of -10, rise by 20 instead of 15
    
    // Grow larger but keep it smaller than before
    entityRef.current.scale.setScalar(progress * 2);
    
    // Rotate slowly
    entityRef.current.rotation.y += 0.005;
  });

  if (!active) return null;

  return (
    <group ref={entityRef} position={[0, -5, 0]}> {/* Start at -5 instead of -10 */}
      {/* Create a smaller strange geometric entity */}
      <mesh>
        <dodecahedronGeometry args={[1, 1]} /> {/* Reduced from 2 to 1 */}
        <meshStandardMaterial 
          color="#8b0000" 
          emissive="#ff0000"
          emissiveIntensity={2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Add orbiting elements (smaller and closer) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 4) * 2, // Reduced from 4 to 2
          Math.sin(i * 0.5) * 1,         // Reduced from 2 to 1
          Math.sin(i * Math.PI / 4) * 2  // Reduced from 4 to 2
        ]}>
          <sphereGeometry args={[0.25, 16, 16]} /> {/* Reduced from 0.5 to 0.25 */}
          <meshStandardMaterial 
            color="#ff3333" 
            emissive="#ff5555"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      
      {/* Add smaller rotating rings */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.5, 0.1, 16, 100]} /> {/* Reduced from 5 to 2.5 */}
          <meshStandardMaterial color="#ff0000" emissive="#ff3333" />
        </mesh>
      </group>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <torusGeometry args={[3, 0.05, 16, 100]} /> {/* Reduced from 6 to 3 */}
          <meshStandardMaterial color="#ff0000" emissive="#ff3333" />
        </mesh>
      </group>
      
      {/* Add intense light with reduced range */}
      <pointLight color="#ff0000" intensity={8} distance={30} /> {/* Reduced intensity and distance */}
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial 
        color="#000000" 
        side={THREE.DoubleSide} 
        roughness={0.8}
      />
    </mesh>
  );
}

function HexagonalField() {
  const [ritualActivated, setRitualActivated] = useState(false);
  
  // Define a list of 25 placeholder URLs
  const urlList = useMemo(() => [
    "https://en.wikipedia.org/wiki/Lunar_eclipse#Blood_moon",
    "https://www.atlasobscura.com/places/the-gates-of-hell-turkmenistan",
    "https://en.wikipedia.org/wiki/Carnelian",
    "https://en.wikipedia.org/wiki/Bloodstone",
    "https://en.wikipedia.org/wiki/Mars",
    "https://en.wikipedia.org/wiki/Red_giant",
    "https://en.wikipedia.org/wiki/Betelgeuse",
    "https://en.wikipedia.org/wiki/Blood_libel",
    "https://en.wikipedia.org/wiki/The_Masque_of_the_Red_Death",
    "https://en.wikipedia.org/wiki/Ritual_sacrifice",
    "https://en.wikipedia.org/wiki/Nyarlathotep",
    "https://en.wikipedia.org/wiki/The_Colour_Out_of_Space",
    "https://en.wikipedia.org/wiki/The_Shadow_over_Innsmouth",
    "https://en.wikipedia.org/wiki/Vermilion",
    "https://en.wikipedia.org/wiki/Bloodletting",
    "https://en.wikipedia.org/wiki/Carmine",
    "https://en.wikipedia.org/wiki/Azathoth",
    "https://en.wikipedia.org/wiki/Cthulhu",
    "https://en.wikipedia.org/wiki/Sanguine"
  ], []);
  
  // Handle ritual activation
  const activateRitual = () => {
    setRitualActivated(true);
    globalState.ritualActivated = true;
    
    // Play a mysterious sound effect
    try {
      const audio = new Audio('/sounds/ritual.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.log('Audio not supported or not found');
    }
  };
  
  // Parameters to control the size distribution
  const centerScale = 1.0;    // Maximum scale at the center
  const edgeScale = 0.15;     // Minimum scale at the edges
  const falloffExponent = 1.8; // Controls how quickly the scale falls off from center to edge
  
  // Generate pyramid positions in a grid
  const pyramids = useMemo(() => {
    const items = [];
    const gridSize = 10; // 10x10 grid = 100 pyramids
    const spacing = 4; // distance between pyramids
    
    // Create a shuffled copy of the URL list for random assignment
    const shuffledUrls = [...urlList].sort(() => Math.random() - 0.5);
    
    // Determine which pyramids will have URLs
    // We'll create a 2D grid of booleans to track which positions have URLs
    const hasUrl = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    
    // Randomly select 25 positions for URLs
    let urlsAssigned = 0;
    while (urlsAssigned < 25) {
      const x = Math.floor(Math.random() * gridSize);
      const z = Math.floor(Math.random() * gridSize);
      
      if (!hasUrl[x][z]) {
        hasUrl[x][z] = true;
        urlsAssigned++;
      }
    }
    
    // Select a position for the special pyramid (not at the center)
    const specialX = 3;
    const specialZ = 3;
    
    // Calculate max distance from center (for normalization)
    const maxDistance = Math.sqrt(2) * ((gridSize - 1) / 2) * spacing;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Calculate position in grid, centered around origin
        const xPos = (x - (gridSize - 1) / 2) * spacing;
        const zPos = (z - (gridSize - 1) / 2) * spacing;
        
        // Calculate distance from center (normalized 0-1)
        const distance = Math.sqrt(xPos * xPos + zPos * zPos) / maxDistance;
        
        // Calculate scale based on distance from center
        // Using a power function to control the falloff
        const distanceFactor = Math.pow(distance, falloffExponent);
        const pyramidScale = centerScale - (centerScale - edgeScale) * distanceFactor;
        
        // Add a small random variation (±10%)
        const randomVariation = 1 + (Math.random() * 0.2 - 0.1);
        const finalScale = pyramidScale * randomVariation;
        
        // Calculate the y position - aligning the bottom to the ground plane
        const yPos = 0.3 * finalScale;
        
        // Add a random rotation offset for varied animation
        const rotOffset = Math.random() * Math.PI * 2;
        
        // Check if this is the special pyramid
        const isSpecial = (x === specialX && z === specialZ);
        
        // Assign URL if this position is marked to have one and not the special pyramid
        const url = !isSpecial && hasUrl[x][z] ? 
          shuffledUrls[urlsAssigned - urlList.length + x + z % urlList.length] : null;
        
        // Add a hover color for some variety
        const hoverColor = isSpecial ? 
          "#FFD700" : // Gold for special pyramid
          (hasUrl[x][z] ? `hsl(${(x * gridSize + z) * 14 % 360}, 70%, 60%)` : null);
        
        items.push({
          position: [xPos, yPos, zPos],
          scale: finalScale,
          rotationOffset: rotOffset,
          distanceFromCenter: distance,
          url,
          hoverColor,
          isSpecial,
          id: `pyramid-${x}-${z}`
        });
      }
    }
    
    return items;
  }, [urlList]);

  return (
    <>
      <Ground />
      {/* Add our navigation pyramid at a specific location */}
      <NavigationPyramid 
        position={[-18, 3, 18]}  // Place it in a different corner from the ritual pyramid
        scale={[0.5, 0.5, 0.5]}  // Make it slightly larger for visibility
      />
      
      {pyramids.map((pyramid) => (
        <HexagonalPyramid 
          key={pyramid.id}
          position={pyramid.position}
          scale={[pyramid.scale, pyramid.scale, pyramid.scale]}
          rotationOffset={pyramid.rotationOffset}
          distanceFromCenter={pyramid.distanceFromCenter}
          url={pyramid.url}
          hoverColor={pyramid.hoverColor}
          isSpecial={pyramid.isSpecial}
          onRitualActivate={pyramid.isSpecial ? activateRitual : null}
        />
      ))}
      <RisingEntity active={ritualActivated} />
    </>
  );
}

// Create a simpler image plane that always shows something
function SimplePlane({ position, index, totalImages, imagePath }) {
  const ref = useRef();
  const initialPosition = useRef(position).current;
  
  // Set color based on index - fallback if no image path is provided - make brighter
  const hue = (index / totalImages) * 360;
  const color = new THREE.Color(`hsl(${hue}, 100%, 70%)`); // Increased lightness from 50% to 70%
  
  // Set up to face the center and handle ritual effects
  useFrame(({ clock }) => {
    if (!ref.current) return;
    
    // Make planes look at center
    const centerPoint = new THREE.Vector3(0, 5, 0);
    
    // Handle ritual effects for the floating planes
    if (globalState.ritualActivated && globalState.ritualProgress > 0) {
      const progress = globalState.ritualProgress;
      const time = clock.getElapsedTime();
      
      // Create different behaviors based on the index
      // This will create varied patterns during the ritual
      const patternIndex = index % 6; // Create 6 different patterns
      
      // Base properties
      let x, y, z, rotX = 0, rotY = 0, rotZ = 0, scale = 1;
      
      switch (patternIndex) {
        case 0: // Circular orbit tightening at a constant height
          {
            const angle = time * (0.2 + progress * 0.3) + (index * Math.PI * 2 / totalImages);
            const radius = initialPosition[0] * (1 - progress * 0.5);
            x = Math.cos(angle) * radius;
            y = initialPosition[1] + Math.sin(time) * progress * 2; // Gentle bobbing
            z = Math.sin(angle) * radius;
            rotZ = time * 0.5;
            scale = 1 + Math.sin(time * 2 + index) * progress * 0.2; // Pulse size
          }
          break;
          
        case 1: // Spiral upward into a column formation
          {
            const angle = time * 0.3 + (index * Math.PI * 2 / totalImages);
            const radius = initialPosition[0] * (1 - progress * 0.7);
            x = Math.cos(angle) * radius;
            y = initialPosition[1] + progress * 15 * (index / totalImages); // Rise in column
            z = Math.sin(angle) * radius;
            rotX = progress * Math.PI * 0.5; // Tilt upward as they form column
            scale = 0.8 - progress * 0.2; // Shrink slightly
          }
          break;
          
        case 2: // Dramatic growing and expanding outward
          {
            const angle = (index * Math.PI * 2 / totalImages) + time * 0.1;
            const radius = initialPosition[0] * (1 + progress * 0.5);
            x = Math.cos(angle) * radius;
            y = initialPosition[1] - progress * 5; // Lower position
            z = Math.sin(angle) * radius;
            rotZ = progress * Math.PI * 2; // Full rotation
            scale = 1 + progress * 2; // Grow significantly
          }
          break;
          
        case 3: // Chaotic orbital dance
          {
            const baseAngle = index * Math.PI * 2 / totalImages;
            const chaosOffset = Math.sin(time * 3 + index) * progress * 15;
            const xAngle = baseAngle + time * 0.2;
            const zAngle = baseAngle + time * 0.3;
            const radius = initialPosition[0] * 0.8;
            x = Math.cos(xAngle) * radius + chaosOffset * 0.2;
            y = initialPosition[1] + Math.sin(time * 5 + index) * progress * 10;
            z = Math.sin(zAngle) * radius + chaosOffset * 0.2;
            rotY = time * progress;
            scale = 1 + progress * Math.sin(time * 4 + index) * 0.5;
          }
          break;
          
        case 4: // Form a protective sphere around the ritual
          {
            const phi = Math.acos(-1 + (2 * index) / totalImages);
            const theta = Math.sqrt(totalImages * Math.PI) * phi;
            const sphereRadius = initialPosition[0] * 0.5;
            x = sphereRadius * Math.cos(theta) * Math.sin(phi) * progress + 
                initialPosition[0] * (1 - progress);
            y = sphereRadius * Math.sin(theta) * Math.sin(phi) * progress + 
                initialPosition[1] * (1 - progress);
            z = sphereRadius * Math.cos(phi) * progress + 
                initialPosition[2] * (1 - progress);
            rotX = progress * Math.PI;
            rotZ = time * progress;
            scale = 0.7 - progress * 0.2;
          }
          break;
          
        case 5: // Whirlpool effect toward the center
        default:
          {
            const angle = Math.atan2(initialPosition[2], initialPosition[0]) + 
                         time * (0.2 + progress);
            const descent = progress * 8;
            const initialRadius = Math.sqrt(initialPosition[0]**2 + initialPosition[2]**2);
            const radius = initialRadius * (1 - progress * 0.8);
            x = Math.cos(angle) * radius;
            y = initialPosition[1] - descent;
            z = Math.sin(angle) * radius;
            rotZ = time * 2 * progress;
            scale = 1 - progress * 0.3;
          }
          break;
      }
      
      // Apply calculated transformations
      ref.current.position.set(x, y, z);
      ref.current.rotation.set(rotX, rotY, rotZ);
      ref.current.scale.set(scale, scale, scale);
      
      // After all transformations are applied, look at the center
      if (patternIndex !== 4) { // Skip for the sphere pattern where orientation matters
        ref.current.lookAt(centerPoint);
      }
    } else {
      // Normal state - just look at center
      ref.current.position.set(position[0], position[1], position[2]);
      ref.current.lookAt(centerPoint);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* If imagePath is provided, try to load it, otherwise use a colored plane */}
      {imagePath ? (
        <mesh>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial 
            map={new THREE.TextureLoader().load(imagePath)}
            side={THREE.DoubleSide}
            transparent={true}
            // Add emissive properties to make texture brighter
            emissive={"white"}
            emissiveMap={new THREE.TextureLoader().load(imagePath)}
            emissiveIntensity={0.6}
            toneMapped={false} // Prevent tone mapping from reducing brightness
          />
        </mesh>
      ) : (
        <mesh>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial 
            color={color} 
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.9} // Increased opacity from 0.8 to 0.9
            // Add emissive properties to make colors brighter
            emissive={color.clone().multiplyScalar(0.8)}
            emissiveIntensity={0.7}
            toneMapped={false} // Prevent tone mapping from reducing brightness
          />
        </mesh>
      )}
    </group>
  );
}

// Component for the circle of floating planes
function FloatingGallery() {
  // Add ref for the entire gallery group
  const galleryRef = useRef();
  
  // Use the loaded file list from the JSON
  const imagePaths = useMemo(() => {
    // Take at most 48 images for better performance
    return redGodImageFiles.slice(0, 48);
  }, []);
  
  // Generate positions in a circle
  const planePositions = useMemo(() => {
    const positions = [];
    const planeCount = imagePaths.length; 
    const radius = 42;
    const height = 8; // Increased from 8 to 15 to position images higher
    
    for (let i = 0; i < planeCount; i++) {
      const angle = (i / planeCount) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      positions.push([x, height, z]);
    }
    
    return positions;
  }, [imagePaths]);
  
  // Animate the gallery rotation
  useFrame(() => {
    if (galleryRef.current) {
      // Rotate the entire gallery slowly around the y-axis (vertical axis in Three.js)
      galleryRef.current.rotation.y += 0.0005; // Very slow rotation
    }
  });
  
  return (
    <group ref={galleryRef}>
      {imagePaths.map((path, index) => (
        <SimplePlane
          key={`plane-${index}`}
          position={planePositions[index]}
          index={index}
          totalImages={imagePaths.length}
          imagePath={path}
        />
      ))}
    </group>
  );
}

// Camera controller to set the initial view angle
function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set up a low angle camera position (close to maxPolarAngle limit)
    const distance = Math.sqrt(15*15 + 15*15 + 15*15); // Maintain the same distance from origin
    const polarAngle = Math.PI / 2.2 - 0.05; // Just slightly above the maxPolarAngle limit
    
    // Convert from spherical to cartesian coordinates
    // In Three.js, Y is up
    const y = distance * Math.cos(polarAngle);
    const horizontalDistance = distance * Math.sin(polarAngle);
    const azimuthalAngle = Math.PI / 4; // 45 degrees
    const x = horizontalDistance * Math.cos(azimuthalAngle);
    const z = horizontalDistance * Math.sin(azimuthalAngle);
    
    // Set camera position
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  
  // Handle ritual effects - camera starts to shake and darken during ritual
  useFrame(({ clock }) => {
    if (globalState.ritualActivated && camera) {
      const progress = globalState.ritualProgress;
      const time = clock.getElapsedTime();
      
      // Add subtle camera shake that increases with progress
      const shakeAmount = progress * 0.1;
      camera.position.x += Math.sin(time * 10) * shakeAmount;
      camera.position.y += Math.cos(time * 15) * shakeAmount;
      camera.position.z += Math.sin(time * 12) * shakeAmount;
      
      // Always look at the center, but higher up now
      camera.lookAt(0, progress * 15, 0); // Look even higher as the entity rises (changed from 10 to 15)
    }
  });
  
  return null;
}

function Extrusions() {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'black' }}>
      <Canvas 
        camera={{ position: [15, 15, 15], fov: 45 }}
        shadows
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        {/* <fog attach="fog" args={['#000', 20, 100]} /> */}
        <HexagonalField />
        <FloatingGallery />
        <CameraController />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true}
          minPolarAngle={Math.PI / 16}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        color: 'white', 
        background: 'rgba(0,0,0,0.5)', 
        padding: '5px 10px', 
        borderRadius: '4px',
        pointerEvents: 'none'
      }}>
        World 376B: The Red Council
      </div>
    </div>
  );
}

export default Extrusions;
