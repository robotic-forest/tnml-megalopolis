import React, { useState, useRef, useEffect } from 'react';

/**
 * UI controls for adjusting shader parameters
 */
export default function ShaderControls({ params, setParams }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activePicker, setActivePicker] = useState(null); // 'light', 'dark', or null
  
  // Refs for handling clicks outside color pickers
  const lightPickerRef = useRef(null);
  const darkPickerRef = useRef(null);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert input values to the appropriate type
    const newValue = type === 'number' 
      ? parseFloat(value) 
      : type === 'checkbox' 
        ? e.target.checked 
        : value;
    
    setParams(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Convert RGB (0-1) to hex string for color input
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  // Convert hex string to RGB (0-1) for shader
  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  };
  
  // Handle color change based on which picker is active
  const handleColorChange = (e) => {
    const rgb = hexToRgb(e.target.value);
    setParams(prev => ({
      ...prev,
      [activePicker === 'light' ? 'lightColor' : 'darkColor']: rgb,
      colorMode: 4 // Switch to custom color mode
    }));
  };
  
  // Handle clicking outside the color picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activePicker === 'light' && 
          lightPickerRef.current && 
          !lightPickerRef.current.contains(event.target)) {
        setActivePicker(null);
      }
      if (activePicker === 'dark' && 
          darkPickerRef.current && 
          !darkPickerRef.current.contains(event.target)) {
        setActivePicker(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePicker]);

  // Ensure numerical display by explicitly converting to numbers
  const displayScale = Number(params.scale).toFixed(1);
  const displayComplexity = Number(params.complexity).toFixed(1);
  
  // Get hex values for colors
  const lightColorHex = params.lightColor ? 
    rgbToHex(params.lightColor.r, params.lightColor.g, params.lightColor.b) : '#ecd199';
  const darkColorHex = params.darkColor ? 
    rgbToHex(params.darkColor.r, params.darkColor.g, params.darkColor.b) : '#8a7850';
  
  // Create gradient background style
  const gradientBackground = `linear-gradient(to right, ${darkColorHex}, ${lightColorHex})`;

  if (collapsed) {
    return (
      <button 
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: '#333',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Show Controls
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: '#333333DD',
      padding: '20px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '300px'
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: '0' }}>Shader Parameters</h3>
        <button 
          onClick={() => setCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Scale: {displayScale}
        </label>
        <input
          type="range"
          name="scale"
          min="0.5"
          max="10"
          step="0.1"
          value={params.scale}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Complexity: {displayComplexity}
        </label>
        <input
          type="range"
          name="complexity"
          min="0.5"
          max="3"
          step="0.1"
          value={params.complexity}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Seed:
        </label>
        <input
          type="number"
          name="seed"
          value={params.seed}
          step="0.01"
          onChange={handleChange}
          style={{ width: '100px' }}
        />
        <button 
          onClick={() => setParams(prev => ({ ...prev, seed: Math.random() * 10 }))}
          style={{
            marginLeft: '8px',
            background: '#555',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Randomize
        </button>
      </div>
      
      {/* Color controls with gradient display */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Color Gradient:</label>
        
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          {/* Gradient strip */}
          <div
            style={{
              height: '20px',
              background: gradientBackground,
              borderRadius: '4px',
              border: '1px solid #888',
              position: 'relative',
              margin: '0 12px'
            }}
          />
          
          {/* Left color picker (dark areas) */}
          <div 
            ref={darkPickerRef}
            style={{ 
              position: 'absolute', 
              left: '12px', 
              bottom: '0',
              top: '-4px',
            }}
          >
            <div
              onClick={() => setActivePicker(activePicker === 'dark' ? null : 'dark')}
              style={{
                width: '28px',
                height: '28px',
                background: darkColorHex,
                border: '2px solid #fff',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                transform: 'translateX(-50%)'
              }}
            />
            {activePicker === 'dark' && (
              <div style={{ position: 'absolute', top: '30px', left: '-10px', zIndex: 10 }}>
                <input
                  type="color"
                  value={darkColorHex}
                  onChange={handleColorChange}
                  style={{ width: '140px', height: '40px' }}
                />
                <div style={{
                  background: '#222',
                  color: '#fff',
                  padding: '4px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  textAlign: 'center',
                  marginTop: '3px'
                }}>
                  Dark Areas
                </div>
              </div>
            )}
          </div>
          
          {/* Right color picker (light areas) */}
          <div 
            ref={lightPickerRef}
            style={{ 
              position: 'absolute', 
              right: '12px', 
              bottom: '0',
              top: '-4px',
            }}
          >
            <div
              onClick={() => setActivePicker(activePicker === 'light' ? null : 'light')}
              style={{
                width: '28px',
                height: '28px',
                background: lightColorHex,
                border: '2px solid #fff',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                transform: 'translateX(50%)'
              }}
            />
            {activePicker === 'light' && (
              <div style={{ position: 'absolute', top: '30px', right: '-70px', zIndex: 10 }}>
                <input
                  type="color"
                  value={lightColorHex}
                  onChange={handleColorChange}
                  style={{ width: '140px', height: '40px' }}
                />
                <div style={{
                  background: '#222',
                  color: '#fff',
                  padding: '4px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  textAlign: 'center',
                  marginTop: '3px'
                }}>
                  Light Areas
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => setParams(prev => ({
              ...prev, 
              lightColor: { r: 0.93, g: 0.82, b: 0.6 }, // Sandy beige
              darkColor: { r: 0.54, g: 0.47, b: 0.31 }, // Darker beige
              colorMode: 4
            }))}
            style={{
              background: 'linear-gradient(to right, #8a7850, #ecd199)',
              color: '#333',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1,
              fontWeight: 'bold',
              textShadow: '0 0 3px white'
            }}
          >
            Sandy Beige
          </button>
          
          <button
            onClick={() => setParams(prev => ({
              ...prev, 
              lightColor: { r: 0.85, g: 0.73, b: 0.53 }, // Lighter stone
              darkColor: { r: 0.45, g: 0.42, b: 0.30 }, // Dark stone
              colorMode: 4
            }))}
            style={{
              background: 'linear-gradient(to right, #736c4d, #d9ba87)',
              color: '#333',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1,
              fontWeight: 'bold',
              textShadow: '0 0 3px white'
            }}
          >
            Desert Stone
          </button>
        </div>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '8px' }}>Color Mode:</label>
        <select 
          name="colorMode"
          value={params.colorMode}
          onChange={handleChange}
          style={{
            background: '#555',
            color: 'white',
            border: 'none',
            padding: '8px',
            width: '100%',
            borderRadius: '4px'
          }}
        >
          <option value={0}>Grayscale</option>
          <option value={1}>Red-Blue Gradient</option>
          <option value={2}>Earth</option>
          <option value={3}>Rainbow</option>
          <option value={4}>Custom Color</option>
        </select>
      </div>
    </div>
  );
}
