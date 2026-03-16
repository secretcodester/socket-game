import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RoleSelection from './components/RoleSelection';
import HostScreen from './components/HostScreen';
import ControllerScreen from './components/ControllerScreen';
import './App.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
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

    newSocket.on('gameStarted', (state) => {
      setGameStarted(true);
      setGameState(state);
    });

    newSocket.on('gameReset', (state) => {
      setGameStarted(false);
      setPlayers(state.players);
      setGameState(state);
    });

    newSocket.on('playerLeft', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
      setPlayers(state.players);
      setGameStarted(state.gameActive);
    });

    return () => newSocket.close();
  }, []);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleJoinGame = (name) => {
    setPlayerName(name);
    if (socket) {
      socket.emit('join', { name, role });
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
      {!role ? (
        <RoleSelection onSelectRole={handleSelectRole} />
      ) : !playerName ? (
        <RoleSelection 
          onSelectRole={handleSelectRole}
          showNamePrompt={true}
          onJoin={handleJoinGame}
        />
      ) : role === 'host' ? (
        <HostScreen
          players={players}
          myId={myId}
          gameStarted={gameStarted}
          playerName={playerName}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
        />
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
