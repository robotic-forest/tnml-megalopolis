import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { Html } from '@react-three/drei'

// Movable building component with position tracking
const Building = ({ id, position = [0, 0, 0], size = [5, 10, 5], color = '#888888', setOrbitEnabled }) => {
  const [displayPosition, setDisplayPosition] = useState(position)
  const [showCoordinates, setShowCoordinates] = useState(false)
  const meshRef = useRef()
  const transformRef = useRef()
  const { gl } = useThree()
  
  // Disable orbit controls function with more aggressive approach
  const disableOrbitControls = useCallback(() => {
    setOrbitEnabled(false)
    
    // Stop propagation of events at the DOM level
    const preventEvents = (e) => {
      e.stopPropagation()
    }
    
    // Add event listeners directly to the DOM element
    const domElement = gl.domElement
    domElement.addEventListener('mousedown', preventEvents, true)
    domElement.addEventListener('mousemove', preventEvents, true)
    domElement.addEventListener('wheel', preventEvents, true)
    
    // Return cleanup function
    return () => {
      domElement.removeEventListener('mousedown', preventEvents, true)
      domElement.removeEventListener('mousemove', preventEvents, true)
      domElement.removeEventListener('wheel', preventEvents, true)
      setOrbitEnabled(true)
    }
  }, [gl, setOrbitEnabled])
  
  // Handle transform controls dragging
  useEffect(() => {
    if (!transformRef.current) return
    
    const handleDraggingChange = (e) => {
      if (e.value) {
        // Start dragging - disable controls
        disableOrbitControls()
      } else {
        // Stop dragging - re-enable controls
        setOrbitEnabled(true)
      }
    }
    
    const controls = transformRef.current
    controls.addEventListener('dragging-changed', handleDraggingChange)
    
    // Change the transform controls settings to make it more prominent
    if (transformRef.current) {
      transformRef.current.showX = true
      transformRef.current.showY = true
      transformRef.current.showZ = true
      transformRef.current.setSize(1.2) // Make controls larger
      transformRef.current.traverse((child) => {
        if (child.material) {
          child.material.depthTest = false // Make sure controls render on top
          child.renderOrder = 999
        }
      })
    }
    
    return () => {
      if (controls) {
        controls.removeEventListener('dragging-changed', handleDraggingChange)
      }
      setOrbitEnabled(true)
    }
  }, [disableOrbitControls, setOrbitEnabled])
  
  // Update position display when moved
  useFrame(() => {
    if (meshRef.current) {
      const currentPosition = meshRef.current.position.toArray()
      
      // Only update if position changed significantly
      const hasChanged = currentPosition.some(
        (coord, i) => Math.abs(coord - displayPosition[i]) > 0.01
      )
      
      if (hasChanged) {
        setDisplayPosition([...currentPosition])
        setShowCoordinates(true)
        
        // Hide coordinates after 3 seconds
        const timeoutId = setTimeout(() => setShowCoordinates(false), 3000)
        return () => clearTimeout(timeoutId)
      }
    }
  })
  
  // Format coordinates for display
  const formattedPosition = displayPosition.map(n => n.toFixed(2))
  
  return (
    <>
      <TransformControls 
        ref={transformRef} 
        object={meshRef} 
        mode="translate"
        onPointerDown={() => disableOrbitControls()}
      >
        <mesh 
          ref={meshRef} 
          position={position}
          onClick={() => setShowCoordinates(true)}
        >
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} />
        </mesh>
      </TransformControls>
      
      {/* Display coordinates when moved */}
      {showCoordinates && (
        <Html
          as='div'
          wrapperClass="building-info-wrapper"
          prepend
          center
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'black',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <div>
            ID: {id}<br />
            X: {formattedPosition[0]}<br />
            Y: {formattedPosition[1]}<br />
            Z: {formattedPosition[2]}
          </div>
        </Html>
      )}
    </>
  )
}

export function CyberFeatures({ setOrbitEnabled }) {
  return (
    <group>
      <Building 
        id="building-001" 
        position={[0, 0, 0]} 
        size={[5, 10, 5]}
        color="#75A5B7"
        setOrbitEnabled={setOrbitEnabled}
      />
    </group>
  )
}
