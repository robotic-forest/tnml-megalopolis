import React from 'react';

// A square button with unicode icon to replace the Controls Toggle Button
const ControlsToggleIcon = ({ isVisible, toggleVisibility }) => {
  return (
    <button 
      onClick={toggleVisibility}
      css={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '28px',
        height: '28px',
        background: '#e0c9a6',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        border: '2px outset #d0c0a0',
        borderRadius: '0',
        cursor: 'pointer',
        zIndex: 100,
        fontFamily: 'monospace',
        '&:hover': {
          background: '#e8d7be'
        }
      }}
      title={isVisible ? "Hide Controls" : "Show Controls"}
    >
      <span className='relative top-[-0.5px]'>{isVisible ? "☰" : "⚙"}</span>
    </button>
  );
};

export default ControlsToggleIcon;
