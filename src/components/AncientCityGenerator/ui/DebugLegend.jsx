import React from 'react';

/**
 * Legend component showing the meaning of helper visualizations
 */
const DebugLegend = ({ visible = false }) => {
  if (!visible) return null;

  // Helper color codes and their meanings
  const legendItems = [
    { color: '#ff0000', label: 'Courtyard Center' },
    { color: '#ff9900', label: 'Courtyard Boundary' },
    { color: '#00ff00', label: 'Room Placement Region' },
    { color: '#0088ff', label: 'Inner Houses Ring' },
    { color: '#5500ff', label: 'Middle Houses Ring' },
    { color: '#aa00ff', label: 'Outer Houses Ring' },
    { color: '#ffff00', label: 'Path Connections' },
    { color: '#ffffff', label: 'Guaranteed House Boundary' }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      padding: '1rem',
      background: '#e0c9a6',
      color: '#000000',
      fontFamily: 'monospace',
      zIndex: 100,
      border: '2px outset #d0c0a0',
      borderRadius: '0',
      minWidth: '220px'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', textAlign: 'center' }}>Debug Helpers</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {legendItems.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '3px',
              backgroundColor: item.color,
              marginRight: '8px',
              boxShadow: '0 0 4px rgba(255,255,255,0.5)'
            }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugLegend;
