import React, { useState } from 'react';
import './RoleSelection.css';

function RoleSelection({ onSelectRole, showNamePrompt, onJoin }) {
  const [playerName, setPlayerName] = useState('');

  const handleRoleSelect = (role) => {
    if (showNamePrompt) {
      if (playerName.trim()) {
        onJoin(playerName);
      }
    } else {
      onSelectRole(role);
    }
  };

  if (showNamePrompt) {
    return (
      <div className="role-selection">
        <div className="role-content">
          <h1>🎮 Join Game</h1>
          <p className="subtitle">Enter your player name</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleRoleSelect(null); }} className="join-form">
            <input
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="role-selection">
      <div className="role-content">
        <h1>🎮 Socket Game</h1>
        <p className="subtitle">Select Your Role</p>
        
        <div className="role-buttons">
          <button 
            className="role-button host-button"
            onClick={() => handleRoleSelect('host')}
          >
            <div className="role-title">🖥️ Host</div>
            <div className="role-description">Main screen on TV/Monitor</div>
          </button>
          
          <button 
            className="role-button controller-button"
            onClick={() => handleRoleSelect('controller')}
          >
            <div className="role-title">📱 Controller</div>
            <div className="role-description">Play from your phone</div>
          </button>
        </div>

        <div className="info">
          <p>🕹️ Host sees the game. Controllers use their phones to play!</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
