import React, { useState } from 'react';
import './GameLobby.css';

function GameLobby({ onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
    }
  };

  return (
    <div className="game-lobby">
      <div className="lobby-content">
        <h1>🎮 Socket Game</h1>
        <p className="subtitle">Couch Multiplayer Gaming</p>
        
        <form onSubmit={handleSubmit} className="join-form">
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit">Join Game</button>
        </form>

        <div className="info">
          <p>📱 Invite your friends to play from their phones!</p>
        </div>
      </div>
    </div>
  );
}

export default GameLobby;
