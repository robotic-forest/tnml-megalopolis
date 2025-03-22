import React, { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CyberGrid } from './CyberGrid'
import { CyberFeatures } from './CyberFeatures'

// Component to disable default controls
function ControlsManager({ isEnabled }) {
  const { gl, camera } = useThree()
  
  useEffect(() => {
    // Store the original event handlers so we can restore them
    const originalOnWheel = gl.domElement.onwheel
    const originalOnPointerDown = gl.domElement.onpointerdown
    const originalOnPointerMove = gl.domElement.onpointermove
    
    // Function to prevent event propagation when controls are disabled
    const preventDefault = (e) => {
      e.stopPropagation()
      e.preventDefault()
    }
    
    // If controls should be disabled, override default handlers
    if (!isEnabled) {
      gl.domElement.onwheel = preventDefault
      gl.domElement.onpointerdown = preventDefault
      gl.domElement.onpointermove = preventDefault
    } else {
      // Restore original handlers if controls should be enabled
      gl.domElement.onwheel = originalOnWheel
      gl.domElement.onpointerdown = originalOnPointerDown
      gl.domElement.onpointermove = originalOnPointerMove
    }
    
    // Cleanup when component unmounts or when isEnabled changes
    return () => {
      gl.domElement.onwheel = originalOnWheel
      gl.domElement.onpointerdown = originalOnPointerDown
      gl.domElement.onpointermove = originalOnPointerMove
    }
  }, [gl, isEnabled])
  
  return null
}

function CybermapContent() {
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Controls Manager to handle raw DOM events */}
      <ControlsManager isEnabled={orbitEnabled} />
      
      {/* Re-enable the OrbitControls - will work together with ControlsManager */}
      <OrbitControls 
        enabled={orbitEnabled}
        makeDefault
        enableDamping={true}
        dampingFactor={0.25}
        minDistance={1}
        maxDistance={1000}
      />
      
      <CyberGrid />
      <CyberFeatures setOrbitEnabled={setOrbitEnabled} />
    </>
  )
}

export function CybermapScene() {
  return (
    <Canvas 
      camera={{ position: [0, 25, 50], fov: 50 }}
      // Disable default behaviors at the Canvas level
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('contextmenu', e => e.preventDefault())
      }}
    >
      <CybermapContent />
    </Canvas>
  )
}
