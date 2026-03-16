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

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    // If host is selected, skip name prompt and join directly
    if (selectedRole === 'host') {
      if (socket) {
        socket.emit('join', { name: 'Host', role: 'host' });
      }
    }
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
      ) : role === 'host' ? (
        <HostScreen
          players={players}
          myId={myId}
          gameStarted={gameStarted}
          playerName="Host"
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
        />
      ) : !playerName ? (
        <RoleSelection 
          onSelectRole={handleSelectRole}
          showNamePrompt={true}
          onJoin={handleJoinGame}
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
