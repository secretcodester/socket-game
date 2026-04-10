import React, { useState, useRef, useEffect } from 'react';
import './ControllerScreen.css';

export const ControllerScreen = ({ myId, playerName, onMove, onAction, players }) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const containerRef = useRef(null);

  const JOYSTICK_RADIUS = 50;
  const CONTAINER_RADIUS = 80;

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

    // Normalize and send to server
    const normalizedX = x / CONTAINER_RADIUS;
    const normalizedY = y / CONTAINER_RADIUS;
    onMove({
      x: normalizedX * 100,
      y: normalizedY * 100
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
    onAction('controller_action');
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
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
              }}
            />
          </div>
          <p className="joystick-hint">Drag to move</p>
        </div>

        <div className="action-section">
          <h2>Actions</h2>
          <button 
            className="action-button"
            onMouseDown={handleActionButton}
            onTouchStart={handleActionButton}
          >
            Action
          </button>
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
