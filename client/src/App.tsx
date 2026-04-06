import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { GameSelection } from './components/GameSelection';
import { RoleSelection } from './components/RoleSelection';
import { HostScreen } from './components/HostScreen';
import { ControllerScreen }from './components/ControllerScreen';
import {
  PlayerData,
  GameState,
  ServerToClientEvents,
  ClientToServerEvents,
} from './types';
import { Role } from 'common/types/role';
import './App.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const App = (): React.ReactNode => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameSelected, setGameSelected] = useState<string | null>(null); // 'game1', 'game2', etc.
  const [role, setRole] = useState<Role | undefined>(undefined); // 'host' or 'controller'
  const [playerName, setPlayerName] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<Record<string, PlayerData>>({});
  const [myId, setMyId] = useState<string>('');
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);
    setMyId(newSocket.id);

    // Listen for game events
    newSocket.on('playerJoined', (updatedPlayers: Record<string, PlayerData>) => {
      // Filter out any host from players list
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc: Record<string, PlayerData>, id: string) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('playerMoved', (data: { playerId: string; position: { x: number; y: number } }) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          ...prev[data.playerId],
          position: data.position
        }
      }));
    });

    newSocket.on('gameStarted', (state: GameState) => {
      setGameStarted(true);
      setGameState(state);
    });

    newSocket.on('gameReset', (state: GameState) => {
      setGameStarted(false);
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc: Record<string, PlayerData>, id: string) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
      setGameState(state);
    });

    newSocket.on('playerLeft', (updatedPlayers: Record<string, PlayerData>) => {
      const filteredPlayers = Object.keys(updatedPlayers)
        .filter(id => updatedPlayers[id].role !== 'host')
        .reduce((acc: Record<string, PlayerData>, id: string) => { acc[id] = updatedPlayers[id]; return acc; }, {});
      setPlayers(filteredPlayers);
    });

    newSocket.on('gameState', (state: GameState) => {
      setGameState(state);
      // Filter out any host from players list
      const filteredPlayers = Object.keys(state.players || {})
        .filter(id => state.players[id].role !== 'host')
        .reduce((acc: Record<string, PlayerData>, id: string) => { acc[id] = state.players[id]; return acc; }, {});
      setPlayers(filteredPlayers);
      setGameStarted(state.gameActive);
    });

    return () => newSocket.close();
  }, []);

  const handleSelectGame = (gameId: string) => {
    setGameSelected(gameId);
  };

  const handleSelectRole = (selectedRole: 'host' | 'controller') => {
    setRole(selectedRole);
    // If host is selected, let them pick the game
    // If controller is selected, they skip game selection
    if (selectedRole === 'controller') {
      // Controllers don't select game - that's the host's job
      // Just join with a prompt for their name
    }
  };

  const handleJoinGame = (name: string) => {
    setPlayerName(name);
    setIsPlayerReady(true);
    if (socket) {
      // For host: use selected game. For controller: game will be communicated by host
      const gameToJoin = role === Role.Host ? gameSelected : null;
      socket.emit('join', { name, role, game: gameToJoin });
    }
  };

  const handleStartGame = () => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }

    socket.emit('startGame');
    setGameStarted(true);
  };

  const handleResetGame = () => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }
    
    socket.emit('resetGame');
  };

  const handlePlayerMove = (position: { x: number; y: number }) => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }
    
    socket.emit('playerMove', position);
  };

  const handlePlayerAction = (action: any) => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }

    socket.emit('playerAction', action);
  };

  const handlePlayerJoinGame = (e: React.FormEvent) => { 
    e.preventDefault(); 
    handleJoinGame(playerName); 
  };
  

  if (!role) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  if (role === Role.Host && !gameSelected) {
    return <GameSelection onSelectGame={handleSelectGame} />;
  }

  if (role === Role.Host) {
     return (
      <HostScreen
          players={players}
          myId={myId}
          gameStarted={gameStarted}
          playerName="Host"
          gameSelected={gameSelected}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
      />
     );
  }

  return (
    <div className="App">
      { !isPlayerReady ? (
        <div className="role-selection">
          <div className="role-content">
            <h1>🎮 Join Game</h1>
            <p className="subtitle">Enter your player name</p>
            
            <form onSubmit={handlePlayerJoinGame} className="join-form">
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
