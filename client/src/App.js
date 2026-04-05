import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameSelection from './components/GameSelection';
import RoleSelection from './components/RoleSelection';
import HostScreen from './components/HostScreen';
import ControllerScreen from './components/ControllerScreen';
import './App.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [gameSelected, setGameSelected] = useState(null); // 'game1', 'game2', etc.
  const [role, setRole] = useState(null); // 'host' or 'controller'
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);
    setMyId(newSocket.id);

    // Listen for game events
    newSocket.on('playerJoined', (updatedPlayers) => {
      // Filter out any host from players list
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
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

    newSocket.on('gameStarted', (state) => {
      setGameStarted(true);
      setGameState(state);
    });

    newSocket.on('gameReset', (state) => {
      setGameStarted(false);
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
      setGameState(state);
    });

    newSocket.on('playerLeft', (updatedPlayers) => {
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
      // Filter out any host from players list
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
      setGameStarted(state.gameActive);
    });

    return () => newSocket.close();
  }, []);

  const handleSelectGame = (gameId) => {
    setGameSelected(gameId);
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    // If host is selected, let them pick the game
    // If controller is selected, they skip game selection
    if (selectedRole === 'controller') {
      // Controllers don't select game - that's the host's job
      // Just join with a prompt for their name
    }
  };

  const handleJoinGame = (name) => {
    setPlayerName(name);
    if (socket) {
      // For host: use selected game. For controller: game will be communicated by host
      const gameToJoin = role === 'host' ? gameSelected : null;
      socket.emit('join', { name, role, game: gameToJoin });
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

  if (role === 'host' && !gameSelected) {
    return <GameSelection onSelectGame={handleSelectGame} />;
  }

  if (role === 'host') {
     <HostScreen
          players={players}
          myId={myId}
          gameStarted={gameStarted}
          playerName="Host"
          gameSelected={gameSelected}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
     />
  }

  return (
    <div className="App">
      { !playerName ? (
        <div className="role-selection">
          <div className="role-content">
            <h1>🎮 Join Game</h1>
            <p className="subtitle">Enter your player name</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleJoinGame(playerName); }} className="join-form">
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button type="submit" disabled={!playerName.trim()}>Join Game</button>
            </form>
          </div>
        </div>
      ) : (
        <ControllerScreen
          myId={myId}
          playerName={playerName}
          onMove={handlePlayerMove}
          onAction={handlePlayerAction}
          players={players}
        />
      )}
    </div>
  );
}

export default App;
