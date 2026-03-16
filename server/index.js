const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Game state
const gameState = {
  host: null,
  players: {},
  gameActive: false
};

// Socket to player mapping
const playerSockets = {};
const socketRoles = {};

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins the game
  socket.on('join', (playerData) => {
    const { name, role } = playerData;
    
    socketRoles[socket.id] = role;

    if (role === 'host') {
      // Set as game host
      if (gameState.host) {
        // Already have a host, reject
        socket.emit('error', { message: 'A host already exists' });
        return;
      }
      gameState.host = socket.id;
      playerSockets[socket.id] = { id: socket.id, name, role, score: 0, position: { x: 0, y: 0 } };
    } else {
      // Add as controller
      playerSockets[socket.id] = { id: socket.id, name, role, score: 0, position: { x: 0, y: 0 } };
    }

    gameState.players = playerSockets;
    io.emit('playerJoined', gameState.players);
    socket.emit('gameState', gameState);

    console.log(`${role === 'host' ? 'Host' : 'Controller'} joined: ${name}`);
  });

  // Handle player movement
  socket.on('playerMove', (position) => {
    if (playerSockets[socket.id]) {
      playerSockets[socket.id].position = position;
      io.emit('playerMoved', {
        playerId: socket.id,
        position: position
      });
    }
  });

  // Handle player actions
  socket.on('playerAction', (action) => {
    if (playerSockets[socket.id]) {
      // Broadcast action to all players
      io.emit('playerAction', {
        playerId: socket.id,
        action: action
      });
    }
  });

  // Start game (only host can do this)
  socket.on('startGame', () => {
    if (socket.id === gameState.host) {
      gameState.gameActive = true;
      io.emit('gameStarted', gameState);
      console.log('Game started by host');
    }
  });

  // Reset game (only host can do this)
  socket.on('resetGame', () => {
    if (socket.id === gameState.host) {
      // Reset all player positions and scores
      Object.keys(playerSockets).forEach(key => {
        playerSockets[key].score = 0;
        playerSockets[key].position = { x: 0, y: 0 };
      });
      gameState.gameActive = false;
      gameState.players = playerSockets;
      io.emit('gameReset', gameState);
      console.log('Game reset by host');
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    const role = socketRoles[socket.id];
    
    if (socket.id === gameState.host) {
      console.log(`Host disconnected: ${socket.id}`);
      gameState.host = null;
      gameState.gameActive = false;
      // Could handle host migration here if needed
    }

    delete playerSockets[socket.id];
    delete socketRoles[socket.id];
    gameState.players = playerSockets;

    io.emit('playerLeft', gameState.players);
    console.log(`${role || 'Unknown'} disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Game server running on http://localhost:${PORT}`);
  console.log(`   Host: http://localhost:${PORT}?role=host`);
  console.log(`   Controllers on mobile: http://<your-ip>:${PORT}?role=controller`);
});
