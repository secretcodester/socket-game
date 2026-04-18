import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { GameSelection } from './components/GameSelection';
import { RoleSelection } from './components/RoleSelection';
import { HostScreen } from './components/HostScreen';
import { ControllerScreen } from './components/ControllerScreen';
import './App.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || window.location.host || 'http://localhost:3001';

console.log('Using socket server:', SOCKET_SERVER);

export const App = () => {
  const [socket, setSocket] = useState(null);
  const [gameSelected, setGameSelected] = useState(null); // 'game1', 'game2', etc.
  const [role, setRole] = useState(null); // 'host' or 'controller'
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [gameItems, setGameItems] = useState([]);
  const [speedBoosts, setSpeedBoosts] = useState({}); // playerId -> {active: boolean, endTime: number}

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`New socket connected: ${newSocket.id}`);
      setMyId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setMyId('');
    });

    // Listen for game events
    newSocket.on('playerJoined', (updatedPlayers) => {
      // Filter out any host from players list
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('playerMoved', (updatedPlayers) => {
      // Filter out any host from players list
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('gameStarted', (state) => {
      setGameStarted(true);
    });

    newSocket.on('gameReset', (state) => {
      setGameStarted(false);
      setGameItems([]); // Clear items
      setSpeedBoosts({}); // Clear speed boosts
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('playerLeave', (updatedPlayers) => {
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('gameState', (state) => {
      // Filter out any host from players list
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc, id) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
      setGameStarted(state.gameActive);
    });

    newSocket.on('roomCreated', (data) => setRoomCode(data.roomCode));

    newSocket.on('error', (error) => {
      alert(error.message);
    });

    newSocket.on('itemSpawned', (item) => {
      setGameItems(prev => [...prev, item]);
    });

    newSocket.on('itemCollected', (data) => {
      setGameItems(prev => prev.filter(item => item.id !== data.itemId));
      // Update player score
      setPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          ...prev[data.playerId],
          score: data.newScore
        }
      }));
    });

    newSocket.on('playerAction', (data) => {
      console.log('Received playerAction:', data);
      if (data.action === 'speedBoost') {
        setSpeedBoosts(prev => ({
          ...prev,
          [data.playerId]: {
            active: true,
            endTime: Date.now() + data.duration
          }
        }));
      } else if (data.action === 'speedBoostEnd') {
        console.log('Speed boost ended for:', data.playerId);
        setSpeedBoosts(prev => ({
          ...prev,
          [data.playerId]: {
            ...prev[data.playerId],
            active: false
          }
        }));
      }
    });

    return () => newSocket.close();
  }, []);

  const handleSelectGame = (gameId) => {
    setGameSelected(gameId);
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    // If host is selected, let them pick the game
    // If controller is selected, ask for room code
  };

  const handleJoinGame = (name, providedRoomCode) => {
    setPlayerName(name);
    setIsPlayerReady(true);
    if (socket) {
      // For host: use selected game. For controller: game will be communicated by host
      const gameToJoin = role === 'host' ? gameSelected : null;
      const joinData = { name, role, game: gameToJoin };
      if (role === 'controller') {
        joinData.roomCode = providedRoomCode;
      }
      socket.emit('join', joinData);
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit('startGame');
    }
    setGameStarted(true);
  };

  const handleResetGame = () => {
    if (!socket) {
      socket.emit('resetGame');
    }
  };

  const handlePlayerMove = (position) => {
    if (!socket) return;

    socket.emit('playerMove', position);
  };

  const handlePlayerAction = (action) => {
    if (!socket) return;
      
    socket.emit('playerAction', action);
  };
  

  if (!role) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  if (role === 'host' && !gameSelected) {
    return <GameSelection onSelectGame={handleSelectGame} />;
  }

  if (role === 'host' && !isPlayerReady) {
    // Host joins immediately after game selection
    handleJoinGame('Host');
    setIsPlayerReady(true);
    return <div>Loading...</div>; // or a loading screen
  }

  if (role === 'host') {
     return (
      <HostScreen
          players={players}
          myId={myId}
          gameStarted={gameStarted}
          playerName="Host"
          gameSelected={gameSelected}
          roomCode={roomCode}
          gameItems={gameItems}
          speedBoosts={speedBoosts}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
      />
     );
  }

  if (role === 'controller' && !isPlayerReady) {
    return (
      <div className="role-selection">
        <div className="role-content">
          <h1>🎮 Join Game</h1>
          <p className="subtitle">Enter room code and your name</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleJoinGame(playerName, roomCodeInput); }} className="join-form">
            <input
              type="text"
              placeholder="Room code (6 digits)..."
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
              required
            />
            <input
              type="text"
              placeholder="Your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
            />
            <button type="submit" disabled={roomCodeInput.length !== 6 || !playerName.trim()}>Join Game</button>
          </form>
        </div>
      </div>
    );
  }

  if (role === 'controller') {
    return (
      <ControllerScreen
        myId={myId}
        playerName={playerName}
        onMove={handlePlayerMove}
        onAction={handlePlayerAction}
        players={players}
        speedBoostActive={speedBoosts[myId]?.active || false}
      />
    );
  }

  return <div>Hmm. Something went wrong.</div>;
}
