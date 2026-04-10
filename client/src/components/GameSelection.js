import React from 'react';
import './GameSelection.css';

export const GameSelection = ({ onSelectGame }) => {
  const games = [
    {
      id: 'game1',
      name: 'Game 1',
      description: 'Arena - Players move around, last one standing wins!',
      emoji: '⚔️',
      color: '#667eea'
    }
  ];

  return (
    <div className="game-selection">
      <div className="selection-container">
        <h1>🕹️ Select a Game</h1>
        <p className="subtitle">Choose a game to play</p>

        <div className="games-grid">
          {games.map(game => (
            <button
              key={game.id}
              className="game-card"
              style={{ '--game-color': game.color }}
              onClick={() => onSelectGame(game.id)}
            >
              <div className="game-emoji">{game.emoji}</div>
              <h2 className="game-name">{game.name}</h2>
              <p className="game-description">{game.description}</p>
              <div className="game-footer">Select</div>
            </button>
          ))}
        </div>

        <div className="info">
          <p>ℹ️ More games coming soon...</p>
        </div>
      </div>
    </div>
  );
}
