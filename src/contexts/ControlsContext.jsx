import React, { createContext, useContext, useState } from 'react'

// Create context with default values to avoid undefined errors
const ControlsContext = createContext({
  orbitControlsEnabled: true,
  setOrbitControlsEnabled: () => {}
})

export function ControlsProvider({ children }) {
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true)
  
  return (
    <ControlsContext.Provider value={{ orbitControlsEnabled, setOrbitControlsEnabled }}>
      {children}
    </ControlsContext.Provider>
  )
}

export function useControlsContext() {
  return useContext(ControlsContext)
}
