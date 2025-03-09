import React from 'react';

/**
 * Simplified house component with improved platform collision detection
 */
const SimpleHouse = ({ 
  position, width, length, height, rotation = 0, age = 1.0, type,
  wireframe = false, castShadow = true, receiveShadow = true
}) => {
  // For debugging - log houses being placed near center 
  React.useEffect(() => {
    if (Math.abs(position.x) < 15 && Math.abs(position.z) < 15) {
      console.log(`House near center at (${position.x.toFixed(2)}, ${position.z.toFixed(2)}), type: ${type}`);
    }
  }, []);
  
  // Color based on age and house type for easier visual debugging
  let baseColor = "#c0a080";
  
  // Different colors by type for easier visual debugging
  if (type === 'guaranteed') {
    baseColor = "#d54c4c"; // Bright red for guaranteed houses
  } else if (type === 'large') {
    baseColor = "#c9b285"; // Beige for inner ring
  } else if (type === 'medium') {
    baseColor = "#b09975"; // Medium brown for middle ring
  } else if (type === 'small') {
    baseColor = "#97805d"; // Darker brown for outer ring
  } else if (type === 'tiny') {
    baseColor = "#7a6e54"; // Darkest brown for tiny houses
  }

  return (
    <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
      {/* Main house box */}
      <mesh 
        castShadow={castShadow} 
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial 
          color={baseColor}
          roughness={0.7}
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Debug shape for guaranteed houses */}
      {type === 'guaranteed' && (
        <group>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute 
                attach="attributes-position" 
                array={new Float32Array([
                  -width/2, 0, -length/2,
                  width/2, 0, -length/2,
                  width/2, 0, -length/2,
                  width/2, 0, length/2,
                  width/2, 0, length/2,
                  -width/2, 0, length/2,
                  -width/2, 0, length/2,
                  -width/2, 0, -length/2
                ])} 
                count={8} 
                itemSize={3} 
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" />
          </lineSegments>
        </group>
      )}
    </group>
  );
};

export default SimpleHouse;
