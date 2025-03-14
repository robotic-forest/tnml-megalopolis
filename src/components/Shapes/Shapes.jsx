import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  MeshDistortMaterial, 
  Sphere,
  Stars,
  Edges
} from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';
// Replace react-router-dom with wouter
import { useLocation } from 'wouter';
import redGodFiles from '../Extrusions/red-god-files.json';

// Texture loading hook
const useRedGodTextures = () => {
  const [textures, setTextures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  useEffect(() => {
    const loadTextures = async () => {
      setIsLoading(true);
      const loadedTextures = [];
      
      // Load a subset of textures for performance (every 3rd texture)
      const filesToLoad = redGodFiles.files.filter((_, index) => index % 3 === 0);
      
      try {
        // Load textures in parallel
        await Promise.all(filesToLoad.map(async (filename) => {
          try {
            const texture = await new Promise((resolve, reject) => {
              textureLoader.load(
                `/red_god/${filename}`,
                resolve,
                undefined,
                (error) => {
                  console.error(`Failed to load texture ${filename}:`, error);
                  reject(error);
                }
              );
            });
            
            // Configure texture properties
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            loadedTextures.push(texture);
          } catch (error) {
            console.error(`Failed to load texture ${filename}:`, error);
          }
        }));
        
        setTextures(loadedTextures);
      } catch (error) {
        console.error("Error loading textures:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTextures();
    
    return () => {
      // Dispose of textures when component unmounts
      textures.forEach(texture => texture.dispose());
    };
  }, [textureLoader]);
  
  return { textures, isLoading };
};

// Floating distortion field
const DistortionField = () => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      meshRef.current.material.distort = 0.3 + Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[8, 24, 24]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#1a237e"
        attach="material"
        transparent
        opacity={0.05}
        distort={0.3}
        speed={2}
      />
    </Sphere>
  );
};

// Special navigation octahedron that redirects to /extrusions
const NavigationOctahedron = () => {
  // Replace useNavigate with useLocation from wouter
  const [location, setLocation] = useLocation();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Floating animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.3 + 1.5; // Hover above other elements
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    }
  });
  
  // Navigate to /extrusions on click with Wouter
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    setLocation('/extrusions'); // Use setLocation instead of navigate
  };
  
  // Change cursor on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  
  // Pulsing glow effect
  const pulseIntensity = useRef(0);
  useFrame(({ clock }) => {
    pulseIntensity.current = 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.emissiveIntensity = hovered ? 1.5 : pulseIntensity.current;
    }
  });
  
  return (
    <mesh 
      ref={meshRef}
      position={[0, 1.5, 0]} // Position it prominently above other elements
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={0.6}
    >
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial 
        color="#ff0000"
        emissive="#ff0000"
        emissiveIntensity={0.8}
        metalness={0.3}
        roughness={0.2}
      />
      {/* Add white edges to the octahedron */}
      <Edges
        threshold={15} // Display all edges
        color="white"
        scale={2.02} // Slightly larger to prevent z-fighting
        opacity={0.75}
      />
    </mesh>
  );
};

// Component for a single cube in our structure with Red God textures
const EldritchCube = ({ initialPosition, color, speedFactor, isUnified, unifiedPosition, textures, toggleUnified }) => {
  const meshRef = useRef();
  const [currentTextureIndex, setCurrentTextureIndex] = useState(
    Math.floor(Math.random() * Math.max(1, textures.length))
  );
  const [geometry, setGeometry] = useState('box');
  const [hasGlitched, setHasGlitched] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Change cursor on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  
  // Randomize initial geometry type
  useEffect(() => {
    const shapes = ['box', 'octahedron', 'tetrahedron'];
    setGeometry(shapes[Math.floor(Math.random() * shapes.length)]);
    
    // Set up occasional geometry "glitches" - less frequent
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.98) {
        setHasGlitched(true);
        const newShape = shapes[Math.floor(Math.random() * shapes.length)];
        setGeometry(newShape);
        setTimeout(() => setHasGlitched(false), 200);
      }
    }, 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  // Periodically change the texture
  useEffect(() => {
    if (textures.length === 0) return;
    
    const textureChangeInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setCurrentTextureIndex(Math.floor(Math.random() * textures.length));
      }
    }, 1000 + Math.random() * 4000); // Random interval between 1-5 seconds
    
    return () => clearInterval(textureChangeInterval);
  }, [textures]);
  
  // Use a ref for position to avoid unnecessary re-renders
  const posRef = useRef({
    current: [...initialPosition],
    target: [...initialPosition],
    direction: [0, 0, 0],
    timer: Math.random() * 2,
    rotationSpeed: [
      Math.random() * 0.005 - 0.0025,
      Math.random() * 0.005 - 0.0025,
      Math.random() * 0.005 - 0.0025
    ],
    scale: 1.0,
    phaseShift: Math.random() * Math.PI * 2
  });
  
  useFrame((state, delta) => {
    try {
      const pos = posRef.current;
      const time = state.clock.getElapsedTime();
      
      // Decide on scale based on unified state and pulsation
      const targetScale = isUnified ? 1.0 : (0.8 + Math.sin(time * 0.3 + pos.phaseShift) * 0.15);
      pos.scale += (targetScale - pos.scale) * delta * 1.5;
      
      // Movement logic remains the same
      if (isUnified) {
        // Move towards unified position with occasional jitter
        const speed = delta * 4;
        const jitterAmount = Math.random() > 0.99 ? 0.1 : 0;
        
        pos.current[0] += ((unifiedPosition[0] + jitterAmount * (Math.random() * 2 - 1)) - pos.current[0]) * speed;
        pos.current[1] += ((unifiedPosition[1] + jitterAmount * (Math.random() * 2 - 1)) - pos.current[1]) * speed;
        pos.current[2] += ((unifiedPosition[2] + jitterAmount * (Math.random() * 2 - 1)) - pos.current[2]) * speed;
      } else {
        // Normal random movement behavior
        pos.timer -= delta;
        
        // Reduced frequency of sudden jolts
        if (Math.random() > 0.997) {
          const jumpDistance = 0.3;
          pos.current[0] += (Math.random() * 2 - 1) * jumpDistance;
          pos.current[1] += (Math.random() * 2 - 1) * jumpDistance;
          pos.current[2] += (Math.random() * 2 - 1) * jumpDistance;
        }
        
        // If we've reached the target position or timer is up, choose a new target
        if (pos.timer <= 0 || 
            (Math.abs(pos.current[0] - pos.target[0]) < 0.01 &&
             Math.abs(pos.current[1] - pos.target[1]) < 0.01 &&
             Math.abs(pos.current[2] - pos.target[2]) < 0.01)) {
          
          // Choose a new direction with right angles - less diagonal movement
          let directions;
          if (Math.random() > 0.9) {
            // Occasionally allow diagonal movement
            const randomDir = [
              Math.random() * 2 - 1, 
              Math.random() * 2 - 1, 
              Math.random() * 2 - 1
            ];
            // Normalize to length 1
            const length = Math.sqrt(
              randomDir[0] * randomDir[0] + 
              randomDir[1] * randomDir[1] + 
              randomDir[2] * randomDir[2]
            );
            directions = [[
              randomDir[0] / length,
              randomDir[1] / length,
              randomDir[2] / length
            ]];
          } else {
            // Standard right-angle movement
            directions = [
              [1, 0, 0], [-1, 0, 0],
              [0, 1, 0], [0, -1, 0],
              [0, 0, 1], [0, 0, -1]
            ];
          }
          
          // Rest of the movement logic
          const newDir = directions[Math.floor(Math.random() * directions.length)];
          const distance = 1 + Math.random() * 2; // Shorter random move distance
          
          // Calculate new target position
          const newTarget = [
            pos.current[0] + newDir[0] * distance,
            pos.current[1] + newDir[1] * distance,
            pos.current[2] + newDir[2] * distance
          ];
          
          // Boundary check with static boundaries for performance
          const boundary = 5;
          const withinBounds = 
            Math.abs(newTarget[0]) <= boundary &&
            Math.abs(newTarget[1]) <= boundary &&
            Math.abs(newTarget[2]) <= boundary;
          
          if (withinBounds) {
            pos.target = newTarget;
            pos.direction = newDir;
            
            // Less frequent rotation speed changes
            if (Math.random() > 0.5) {
              pos.rotationSpeed = [
                Math.random() * 0.01 - 0.005,
                Math.random() * 0.01 - 0.005,
                Math.random() * 0.01 - 0.005
              ];
            }
          }
          
          pos.timer = 1 + Math.random() * 2; // Set new timer for next direction change
        }
        
        // Move towards target position
        const baseSpeed = delta * 1.5 * speedFactor;
        const speed = Math.random() > 0.97 ? baseSpeed * 2 : baseSpeed; // Occasional speed burst
        
        pos.current[0] += (pos.target[0] - pos.current[0]) * speed;
        pos.current[1] += (pos.target[1] - pos.current[1]) * speed;
        pos.current[2] += (pos.target[2] - pos.current[2]) * speed;
      }
      
      // Update mesh position and rotation
      if (meshRef.current) {
        // Position
        meshRef.current.position.set(
          pos.current[0], 
          pos.current[1], 
          pos.current[2]
        );
        
        // Scale with less variation between axes
        meshRef.current.scale.set(
          pos.scale,
          pos.scale,
          pos.scale
        );
        
        // Rotation - create strange tumbling
        meshRef.current.rotation.x += pos.rotationSpeed[0];
        meshRef.current.rotation.y += pos.rotationSpeed[1];
        meshRef.current.rotation.z += pos.rotationSpeed[2];
      }
    } catch (error) {
      // Error boundary to prevent scene crashes
      console.error("Error in EldritchCube animation frame", error);
    }
  });

  // Generate appropriate geometry based on current state
  const renderGeometry = () => {
    switch(geometry) {
      case 'octahedron':
        return <octahedronGeometry args={[0.5]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[0.6]} />;
      default:
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    }
  };
  
  // Select current texture or fallback to a color material
  const currentTexture = textures.length > 0 && currentTextureIndex < textures.length 
    ? textures[currentTextureIndex] 
    : null;
  
  // Increase emissive intensity when hovered
  const emissiveIntensity = hovered ? 0.8 : 0.4;
  const hoverColor = hovered ? '#ffffff' : '#ffffff';
  
  return (
    <mesh 
      ref={meshRef} 
      position={initialPosition} 
      castShadow 
      receiveShadow
      onClick={toggleUnified}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      {renderGeometry()}
      {hasGlitched ? (
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
      ) : currentTexture ? (
        <meshStandardMaterial 
          map={currentTexture} 
          color={hoverColor} 
          emissiveMap={currentTexture}
          emissive={hoverColor}
          emissiveIntensity={emissiveIntensity}
          transparent={true}
          opacity={1}
        />
      ) : (
        <meshStandardMaterial color={hoverColor} emissive={hoverColor} emissiveIntensity={hovered ? 0.3 : 0} />
      )}
      
      {/* Add white edges to all objects */}
      <Edges
        threshold={15} // Display all edges
        color="red"
        scale={1.5} // Slightly larger to prevent z-fighting
        opacity={hasGlitched ? 1 : 0.6} // More visible during glitch
      />
    </mesh>
  );
};

// Component for the entire strange shape structure
const StrangeShape = ({ isUnified, textures, toggleUnified }) => {
  const [formationMode, setFormationMode] = useState(0);
  
  // Change formation mode occasionally when unified
  useEffect(() => {
    if (!isUnified) return;
    
    const interval = setInterval(() => {
      setFormationMode(prev => (prev + 1) % 3);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isUnified]);
  
  const cubes = useMemo(() => {
    const numberOfCubes = 50; // Reduced number of cubes for performance
    const result = [];
    
    for (let i = 0; i < numberOfCubes; i++) {
      // Create a more interesting initial arrangement
      const t = i / numberOfCubes;
      const height = (Math.random() * 2 - 1) * 3; // Random height between -3 and 3
      
      // Create a spiral pattern on each level
      const angle = i * 0.5;
      const radius = 1.5 + t * 2;
      
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      // Color gradient: green at top, blue at bottom
      const normalizedHeight = (height + 3) / 6;
      const color = new THREE.Color(
        0, // No red
        Math.max(0.2, normalizedHeight), // More green on top
        Math.max(0.2, 1 - normalizedHeight) // More blue at bottom
      );
      
      // Random speed factor
      const speedFactor = 0.5 + Math.random() * 1.5;
      
      // Different unified formation positions based on mode
      let unifiedX, unifiedY, unifiedZ;
      
      switch(formationMode) {
        case 0: // Spherical formation
          const phi = Math.acos(-1 + (2 * i) / numberOfCubes);
          const theta = Math.sqrt(numberOfCubes * Math.PI) * phi;
          unifiedX = 2 * Math.cos(theta) * Math.sin(phi);
          unifiedY = 2 * Math.sin(theta) * Math.sin(phi);
          unifiedZ = 2 * Math.cos(phi);
          break;
          
        case 1: // Twisted torus
          const u = i / numberOfCubes * Math.PI * 2;
          const v = (i % 10) / 10 * Math.PI * 2;
          const r1 = 3; // major radius
          const r2 = 1; // minor radius
          unifiedX = (r1 + r2 * Math.cos(v)) * Math.cos(u);
          unifiedY = (r1 + r2 * Math.cos(v)) * Math.sin(u);
          unifiedZ = r2 * Math.sin(v);
          break;
          
        case 2: // Strange attractor pattern - simplified
          const step = i * 0.06;
          unifiedX = Math.sin(step) * Math.cos(step * 2) * 3;
          unifiedY = Math.cos(step * 3) * Math.sin(step) * 3;
          unifiedZ = Math.sin(step * 2) * 3;
          break;
      }
      
      result.push({
        position: [x, height, z],
        unifiedPosition: [unifiedX, unifiedY, unifiedZ],
        color: color,
        speedFactor,
        key: i
      });
    }
    
    return result;
  }, [formationMode]);
  
  return (
    <>
      {/* Add the navigation octahedron */}
      <NavigationOctahedron />
      
      {cubes.map((cube) => (
        <EldritchCube 
          key={cube.key}
          initialPosition={cube.position}
          unifiedPosition={cube.unifiedPosition}
          color={cube.color}
          speedFactor={cube.speedFactor}
          isUnified={isUnified}
          textures={textures}
          toggleUnified={toggleUnified}
        />
      ))}
    </>
  );
};

// 3D Scene - simplified for performance
const Scene = ({ isUnified, textures, toggleUnified }) => {
  return (
    <>
      <StrangeShape isUnified={isUnified} textures={textures} toggleUnified={toggleUnified} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
    </>
  );
};

// Loading indicator component for textures
const TextureLoadingIndicator = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      Loading Textures{dots}
    </div>
  );
};

export const Shapes = () => {
  const [isUnified, setIsUnified] = useState(false);
  const { textures, isLoading } = useRedGodTextures();
  
  const toggleUnified = () => {
    setIsUnified(prev => !prev);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>  
      <Canvas 
        camera={{ position: [10, 5, 10] }} 
        style={{ background: 'black' }}
        shadows={false}
        gl={{ 
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          depth: true 
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0077ff" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#4f9" />
        <pointLight position={[0, 2, 0]} intensity={0.8} color="#ff0000" /> {/* Red light for octahedron */}
        <Scene isUnified={isUnified} textures={textures} toggleUnified={toggleUnified} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          enableDamping={false}
        />
      </Canvas>
      
      {/* SVG Cube removed - now we click directly on 3D objects */}
    </div>
  );
};