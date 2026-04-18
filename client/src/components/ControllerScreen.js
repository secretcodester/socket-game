import React, { useState, useRef, useEffect } from 'react';
import './ControllerScreen.css';

const CONTAINER_RADIUS = 80;

export const ControllerScreen = ({ myId, playerName, onMove, onAction, players, speedBoostActive, speedBoostDisabled }) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const containerRef = useRef(null);


  const handleJoystickStart = (e) => {
    setJoystickActive(true);
    updateJoystick(e);
  };

  const handleJoystickMove = (e) => {
    if (joystickActive) {
      updateJoystick(e);
    }
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const updateJoystick = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let x = touch.clientX - rect.left - centerX;
    let y = touch.clientY - rect.top - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);

    // Limit to container radius
    if (distance > CONTAINER_RADIUS) {
      const angle = Math.atan2(y, x);
      x = Math.cos(angle) * CONTAINER_RADIUS;
      y = Math.sin(angle) * CONTAINER_RADIUS;
    }

    setJoystickPos({ x, y });

    // Normalize joystick position
    const normalizedX = x / CONTAINER_RADIUS;
    const normalizedY = y / CONTAINER_RADIUS;
    
    // Send velocity to server
    const velocityX = normalizedX * 5; // Adjust speed multiplier
    const velocityY = normalizedY * 5;
    onMove({
      x: velocityX,
      y: velocityY
    });
  }; 

  useEffect(() => {
    window.addEventListener('mousemove', handleJoystickMove);
    window.addEventListener('mouseup', handleJoystickEnd);
    window.addEventListener('touchmove', handleJoystickMove, { passive: false });
    window.addEventListener('touchend', handleJoystickEnd);

    return () => {
      window.removeEventListener('mousemove', handleJoystickMove);
      window.removeEventListener('mouseup', handleJoystickEnd);
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
    };
  }, [joystickActive]);

  const handleActionButton = () => {
    if (!speedBoostActive) {
      onAction('speedBoost');
    }
  };

  // Find current player
  const currentPlayer = players[myId];

  return (
    <div className="controller-screen">
      <div className="controller-header">
        <h1>🕹️ Game Controller</h1>
        <div className="player-info-bar">
          <span className="player-name-badge">{playerName}</span>
          {currentPlayer && (
            <span className="player-score-badge">Score: {currentPlayer.score || 0}</span>
          )}
        </div>
      </div>

      <div className="controller-content">
        <div className="joystick-section">
          <h2>Movement</h2>
          <div
            ref={containerRef}
            className="joystick-container"
            onMouseDown={handleJoystickStart}
            onTouchStart={handleJoystickStart}
          >
            <div className="joystick-background" />
            <div
              ref={joystickRef}
              className={`joystick-handle ${joystickActive ? 'active' : ''}`}
              style={{
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
              }}
            />
          </div>
          <p className="joystick-hint">Drag to move</p>
        </div>

        <div className="action-section">
          <h2>Actions</h2>
          <button 
            className={`action-button ${speedBoostActive ? 'active' : ''} ${speedBoostDisabled ? 'inactive' : ''}`}
            onMouseDown={handleActionButton}
            onTouchStart={handleActionButton}
            disabled={speedBoostActive || speedBoostDisabled}
          >
            🚀
          </button>
          {speedBoostActive && <p className="action-status">Speed boost active!</p>}
	  {speedBoostDisabled && <p className="action-status">Speed boost on cooldown!</p>}
        </div>
      </div>

      <div className="controller-footer">
        <p className="connected-text">✓ Connected to game host</p>
        <p className="game-status">
          {currentPlayer ? 'Ready to play!' : 'Waiting for game to start...'}
        </p>
      </div>
    </div>
  );
}
