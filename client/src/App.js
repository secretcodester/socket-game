import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameLobby from './components/GameLobby';
import GameCanvas from './components/GameCanvas';
import './App.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);
    setMyId(newSocket.id);

    // Listen for game events
    newSocket.on('playerJoined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('playerMoved', (data) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          ...prev[data.playerId],
          position: data.position
        }
      }));
    });

    newSocket.on('gameStarted', (gameState) => {
      setGameStarted(true);
    });

    newSocket.on('gameReset', (gameState) => {
      setGameStarted(false);
      setPlayers(gameState.players);
    });

    newSocket.on('playerLeft', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => newSocket.close();
  }, []);

  const handleJoinGame = (name) => {
    setPlayerName(name);
    if (socket) {
      socket.emit('join', { name });
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit('startGame');
    }
  };

  const handleResetGame = () => {
    if (socket) {
      socket.emit('resetGame');
    }
  };

  const handlePlayerMove = (position) => {
    if (socket) {
      socket.emit('playerMove', position);
    }
  };

  const handlePlayerAction = (action) => {
    if (socket) {
      socket.emit('playerAction', action);
    }
  };

  return (
    <div className="App">
      {!playerName ? (
        <GameLobby onJoin={handleJoinGame} />
      ) : gameStarted ? (
        <GameCanvas
          players={players}
          myId={myId}
          onMove={handlePlayerMove}
          onAction={handlePlayerAction}
          onReset={handleResetGame}
        />
      ) : (
        <div className="waiting-room">
          <div className="waiting-content">
            <h1>🎮 Socket Game Lobby</h1>
            <p>Welcome, {playerName}!</p>
            <div className="players-list">
              <h2>Players ({Object.keys(players).length})</h2>
              <ul>
                {Object.values(players).map(player => (
                  <li key={player.id}>
                    {player.name}
                    {player.id === myId && ' (You)'}
                  </li>
                ))}
              </ul>
            </div>
            <button className="start-button" onClick={handleStartGame}>
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
