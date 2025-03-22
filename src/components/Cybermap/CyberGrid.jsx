import React, { useMemo } from 'react'
import * as THREE from 'three'

export function CyberGrid() {
  // Valley dimensions
  const valleyLength = 200 // Length of the valley (long dimension)
  const valleyWidth = 100 // Width of the valley (short dimension)
  const valleyDepth = 30 // How deep the valley is
  const topPlatformWidth = 20 // Width of flat area at the top before steps begin
  const bottomPlatformWidth = 10 // Width of flat area at the bottom
  const stepCount = 45 // Number of steps on each side
  
  // Create the unified valley geometry using Shape and ExtrudeGeometry
  const unifiedValleyGeometry = useMemo(() => {
    // Calculate step dimensions
    const stepWidth = (valleyWidth / 2 - topPlatformWidth - bottomPlatformWidth / 2) / stepCount
    const stepHeight = valleyDepth / stepCount
    
    // Create a shape that represents the cross-section of our valley
    // We'll draw the outline directly without using holes
    const shape = new THREE.Shape()
    
    // Start at the outer left edge, top
    shape.moveTo(-valleyWidth / 2, 0)
    
    // Draw the left platform
    shape.lineTo(-valleyWidth / 2 + topPlatformWidth, 0)
    
    // Draw the left steps going down
    for (let i = 0; i < stepCount; i++) {
      // Vertical line down
      shape.lineTo(
        -valleyWidth / 2 + topPlatformWidth + stepWidth * i, 
        -stepHeight * (i + 1)
      )
      // Horizontal line toward center
      shape.lineTo(
        -valleyWidth / 2 + topPlatformWidth + stepWidth * (i + 1), 
        -stepHeight * (i + 1)
      )
    }
    
    // Draw the bottom platform
    shape.lineTo(-bottomPlatformWidth / 2, -valleyDepth)
    shape.lineTo(bottomPlatformWidth / 2, -valleyDepth)
    
    // Draw the right steps going up
    for (let i = 0; i < stepCount; i++) {
      // Horizontal line toward right
      shape.lineTo(
        valleyWidth / 2 - topPlatformWidth - stepWidth * (stepCount - i - 1), 
        -stepHeight * (stepCount - i)
      )
      // Vertical line up
      shape.lineTo(
        valleyWidth / 2 - topPlatformWidth - stepWidth * (stepCount - i - 1), 
        -stepHeight * (stepCount - i - 1)
      )
    }
    
    // Draw the right platform
    shape.lineTo(valleyWidth / 2 - topPlatformWidth, 0)
    shape.lineTo(valleyWidth / 2, 0)
    
    // Draw the outer edges to close the shape
    shape.lineTo(valleyWidth / 2, -valleyDepth)
    shape.lineTo(-valleyWidth / 2, -valleyDepth)
    shape.lineTo(-valleyWidth / 2, 0)
    
    // Create extrusion settings
    const extrudeSettings = {
      steps: 1,
      depth: valleyLength,
      bevelEnabled: false,
    }
    
    // Create the extruded geometry
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    
    // Center the geometry
    geometry.center()
    
    // Apply rotations to correctly orient the valley
    geometry.rotateZ(Math.PI / 2)
    geometry.rotateX(Math.PI / 2)
    geometry.rotateZ(Math.PI / 2)
    geometry.rotateX(Math.PI)
    
    return geometry
  }, [])
  
  return (
    <group>
      <mesh geometry={unifiedValleyGeometry}>
        <meshStandardMaterial 
          color="#AAAAAA" 
          roughness={0.5}
          metalness={0.3}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}