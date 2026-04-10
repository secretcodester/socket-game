import React, { useState } from 'react';
import HostGameDashboard from './HostGameDashboard';
import './HostScreen.css';

function HostScreen({
  players,
  myId,
  gameStarted,
  playerName,
  gameSelected,
  onStartGame,
  onResetGame,
}) {
  const [showLobby, setShowLobby] = useState(true);

  const handleStartGame = () => {
    setShowLobby(false);
    onStartGame();
  };

  const handleResetGame = () => {
    setShowLobby(true);
    onResetGame();
  };

  if (showLobby || !gameStarted) {
    return (
      <div className="host-lobby">
        <div className="lobby-container">
          <h1>🖥️ Game Host Screen</h1>
          <p className="game-title">
            {gameSelected === 'game1' && '⚔️ Game 1'}
            {gameSelected === 'game2' && '🎮 Game 2'}
          </p>
          <p className="host-info">Waiting for players...</p>

          <div className="players-section">
            <h2>Connected Controllers ({Object.keys(players).filter(id => players[id].role === 'controller').length})</h2>
            <div className="players-grid">
              {Object.values(players).length > 0 ? (
                Object.values(players).filter(p => p.role === 'controller').map(player => (
                  <div key={player.id} className="player-card">
                    <div className="player-avatar">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="player-info">
                      <p className="player-name">{player.name}</p>
                      <p className="player-score">Score: {player.score || 0}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-players">No players connected yet</div>
              )}
            </div>
          </div>

          <div className="lobby-actions">
            {Object.keys(players).length > 0 && (
              <button className="start-button" onClick={handleStartGame}>
                Start Game
              </button>
            )}
            {Object.keys(players).length === 0 && (
              <p className="waiting-text">Waiting for first player...</p>
            )}
          </div>

          <div className="connection-info">
            <p>📱 Share your room code or IP address with other players</p>
            <p>They can join as "Controller" and play on their phones</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HostGameDashboard
      players={players}
      onReset={handleResetGame}
    />
  );
}

export default HostScreen;
