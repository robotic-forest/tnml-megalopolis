import { PLATFORM_STYLES } from "../platform/constants";
import { TEMPLE_STYLES } from "../temple/Temple";
import { SETTINGS_DEFAULTS } from "../utils/constants";

// UI Controls component with updated styling
export const Controls = ({ 
  seed, setSeed, 
  complexity, setComplexity, 
  heightVariation, setHeightVariation,
  courtyardCount, setCourtyardCount,
  courtyardSize, setCourtyardSize,
  courtyardSpacing, setCourtyardSpacing,
  platformSeed, setPlatformSeed,
  platformSize, setPlatformSize,
  wireframe, setWireframe,
  showHelpers, setShowHelpers, // New prop for debug helpers
  isVisible, // New visibility prop
  toggleVisibility,
  templeStyle, setTempleStyle,
  templeSize, setTempleSize,
  platformStyle, setPlatformStyle // New platform style props
}) => {
  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * SETTINGS_DEFAULTS.seed.max));
  };

  const randomizePlatformSeed = () => {
    setPlatformSeed(Math.floor(Math.random() * SETTINGS_DEFAULTS.platformSeed.max));
  };

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div style={{
      position: 'absolute',
      top: '6px',
      right: '6px',
      padding: '1rem',
      background: '#e0c9a6',
      color: '#000000', 
      fontFamily: 'monospace', // Changed to monospace
      zIndex: 100,
      maxHeight: 'calc(100vh - 12px)',
      overflowY: 'auto',
      border: '2px outset #d0c0a0', // Windows 95-style outset border
      borderRadius: '0' // Square corners for Win95 look
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <h4 style={{ margin: '0', fontSize: '16px' }}>Ancient City Generator</h4>
        <button 
          onClick={() => toggleVisibility()}
          css={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e0c9a6',
            border: '2px outset #d0c0a0',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'black',
            padding: 0,
            '&:hover': {
              background: '#e8d7be'
            }
          }}
          title="Hide Controls"
        >
          ✕
        </button>
      </div>
      
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Display Options</h4>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Wireframe Mode
        </label>
        
        {/* New checkbox for debug helpers */}
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={showHelpers}
            onChange={(e) => setShowHelpers(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Show Helpers
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>
          City Seed: 
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '80px' }}
          />
        </label>
        <button 
          onClick={randomizeSeed}
          css={{
            height: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e0c9a6',
            border: '2px outset #d0c0a0',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'black',
            padding: '0px 4px',
            '&:hover': {
              background: '#e8d7be'
            }
          }}
        >
          Randomize
        </button>
      </div>

      {/* New Platform Controls Section - updated for Win95 style */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Platform Controls</h4>
        <div style={{ marginBottom: '0.5rem' }}>
          <label css={{ marginRight: '0.5rem' }}>
            Platform Seed: 
            <input
              type="number"
              value={platformSeed}
              onChange={(e) => setPlatformSeed(parseInt(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </label>
          <button 
            onClick={randomizePlatformSeed}
            css={{
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#e0c9a6',
              border: '2px outset #d0c0a0',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'black',
              padding: '0px 4px',
              '&:hover': {
                background: '#e8d7be'
              }
            }}
          >
            Randomize
          </button>
        </div>
        <div>
          <label>
            Platform Size:
            <input
              type="range"
              min={SETTINGS_DEFAULTS.platformSize.min}
              max={SETTINGS_DEFAULTS.platformSize.max}
              step={SETTINGS_DEFAULTS.platformSize.step}
              value={platformSize}
              onChange={(e) => setPlatformSize(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {platformSize.toFixed(1)}
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>
            Style:
            <select 
              value={platformStyle}
              onChange={(e) => setPlatformStyle(e.target.value)}
              style={{ 
                marginLeft: '0.5rem',
                background: '#e0c9a6',
                border: '1px inset #c0b090',
                padding: '2px 4px',
                color: '#000000', // Ensure text is black
                appearance: 'auto', // Use browser default dropdown appearance
                WebkitAppearance: 'menulist', // Force standard dropdown on WebKit
                MozAppearance: 'menulist', // Force standard dropdown on Firefox
                fontFamily: 'monospace' // Match other controls font
              }}
            >
              <option value={PLATFORM_STYLES.STANDARD}>{PLATFORM_STYLES.STANDARD}</option>
              <option value={PLATFORM_STYLES.STEPPED}>{PLATFORM_STYLES.STEPPED}</option>
              {/* Removed TERRACED option */}
            </select>
          </label>
        </div>
      </div>

      {/* Existing sliders - updated to use settings defaults */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Complexity:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.complexity.min}
            max={SETTINGS_DEFAULTS.complexity.max}
            step={SETTINGS_DEFAULTS.complexity.step}
            value={complexity}
            onChange={(e) => setComplexity(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {complexity.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Height Variation:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.heightVariation.min}
            max={SETTINGS_DEFAULTS.heightVariation.max}
            step={SETTINGS_DEFAULTS.heightVariation.step}
            value={heightVariation}
            onChange={(e) => setHeightVariation(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {heightVariation.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Count:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardCount.min}
            max={SETTINGS_DEFAULTS.courtyardCount.max}
            step={SETTINGS_DEFAULTS.courtyardCount.step}
            value={courtyardCount}
            onChange={(e) => setCourtyardCount(parseInt(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardCount}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Size:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardSize.min}
            max={SETTINGS_DEFAULTS.courtyardSize.max}
            step={SETTINGS_DEFAULTS.courtyardSize.step}
            value={courtyardSize}
            onChange={(e) => setCourtyardSize(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardSize.toFixed(1)}
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Courtyard Spacing:
          <input
            type="range"
            min={SETTINGS_DEFAULTS.courtyardSpacing.min}
            max={SETTINGS_DEFAULTS.courtyardSpacing.max}
            step={SETTINGS_DEFAULTS.courtyardSpacing.step}
            value={courtyardSpacing}
            onChange={(e) => setCourtyardSpacing(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '120px' }}
          />
          {courtyardSpacing.toFixed(1)}
        </label>
      </div>

      {/* New Temple Controls Section - Updated dropdown styling */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem',
        background: '#d0c0a0',
        border: '1px inset #c0b090',
        borderRadius: '0' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Temple Controls</h4>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>
            Style:
            <select 
              value={templeStyle}
              onChange={(e) => setTempleStyle(e.target.value)}
              style={{ 
                marginLeft: '0.5rem',
                background: '#e0c9a6',
                border: '1px inset #c0b090',
                padding: '2px 4px',
                color: '#000000', // Ensure text is black
                appearance: 'auto', // Use browser default dropdown appearance
                WebkitAppearance: 'menulist', // Force standard dropdown on WebKit
                MozAppearance: 'menulist', // Force standard dropdown on Firefox
                fontFamily: 'monospace' // Match other controls font
              }}
            >
              <option value={TEMPLE_STYLES.SIMPLE}>{TEMPLE_STYLES.SIMPLE}</option>
              <option value={TEMPLE_STYLES.GROOVED}>{TEMPLE_STYLES.GROOVED}</option>
              {/* More options can be added here later */}
            </select>
          </label>
        </div>
        
        <div>
          <label>
            Temple Size:
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={templeSize}
              onChange={(e) => setTempleSize(parseFloat(e.target.value))}
              style={{ marginLeft: '0.5rem', width: '120px' }}
            />
            {templeSize.toFixed(1)}x
          </label>
        </div>
      </div>

      {/* CSS fix for range inputs to vertically align with text and add space between sliders and values */}
      <style>{`
        input[type="range"] {
          vertical-align: middle;
          margin-top: 0;
          margin-bottom: 0;
          margin-right: 0.5rem; /* Add space between slider and value */
        }
      `}</style>
    </div>
  );
};